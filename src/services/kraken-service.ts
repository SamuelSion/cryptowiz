import axios from "axios";
import type { OhlcCandle } from "../models/coin";
import { appConfig } from "../utils/app-config";

interface KrakenAsset {
  altname: string;
}

interface KrakenAssetPair {
  base: string;
  quote: string;
}

interface KrakenTickerEntry {
  // 'c' = last trade closed [price, lot volume]
  c: [string, string];
}

interface RawKrakenCandle {
  0: number; // time (unix seconds)
  1: string; // open
  2: string; // high
  3: string; // low
  4: string; // close
}

export class UnsupportedByKrakenError extends Error {}

class KrakenService {
  // Kraken uses different symbols for a couple of legacy assets.
  private readonly symbolOverrides: Record<string, string> = {
    XBT: "BTC",
    XDG: "DOGE",
  };

  // Kraken's native OHLC interval sizes (minutes). 480 and 720 aren't
  // supported, so those are built by merging 240-minute candles.
  private readonly nativeIntervalsMin = [1, 5, 15, 30, 60, 240, 1440, 10080, 21600] as const;

  // symbol -> Kraken pair identifier (e.g. "BTC" -> "XXBTZUSD").
  private cachedPairMap: Record<string, string> | null = null;
  private cachedAt = 0;
  private readonly cacheTtlMs = appConfig.krakenPairMapCacheTtlMs;

  private async buildPairMap(): Promise<Record<string, string>> {
    const now = Date.now();
    if (this.cachedPairMap && now - this.cachedAt < this.cacheTtlMs) {
      return this.cachedPairMap;
    }

    const [assetsResponse, pairsResponse] = await Promise.all([
      axios.get<{ result: Record<string, KrakenAsset> }>(`${appConfig.krakenBaseUrl}/Assets`),
      axios.get<{ result: Record<string, KrakenAssetPair> }>(`${appConfig.krakenBaseUrl}/AssetPairs`),
    ]);

    const assetAltnames: Record<string, string> = {};
    for (const [assetKey, asset] of Object.entries(assetsResponse.data.result)) {
      assetAltnames[assetKey] = asset.altname;
    }

    const map: Record<string, string> = {};
    for (const [pairKey, pair] of Object.entries(pairsResponse.data.result)) {
      const quoteAltname = assetAltnames[pair.quote] ?? pair.quote;
      if (quoteAltname !== "USD") {
        continue;
      }
      const baseAltname = assetAltnames[pair.base] ?? pair.base;
      const symbol = (this.symbolOverrides[baseAltname] ?? baseAltname).toUpperCase();

      // Keep the first match if a symbol maps to more than one USD pair.
      if (!(symbol in map)) {
        map[symbol] = pairKey;
      }
    }

    this.cachedPairMap = map;
    this.cachedAt = now;
    return map;
  }

  private toCandle(raw: RawKrakenCandle): OhlcCandle {
    return {
      time: raw[0] * 1000,
      open: parseFloat(raw[1]),
      high: parseFloat(raw[2]),
      low: parseFloat(raw[3]),
      close: parseFloat(raw[4]),
    };
  }

  // Merges every `factor` consecutive candles into one.
  private mergeCandles(candles: OhlcCandle[], factor: number): OhlcCandle[] {
    const merged: OhlcCandle[] = [];
    for (let i = 0; i < candles.length; i += factor) {
      const group = candles.slice(i, i + factor);
      if (group.length === 0) continue;
      merged.push({
        time: group[0].time,
        open: group[0].open,
        close: group[group.length - 1].close,
        high: Math.max(...group.map((c) => c.high)),
        low: Math.min(...group.map((c) => c.low)),
      });
    }
    return merged;
  }

  private async fetchRawOhlc(pairKey: string, intervalMin: number): Promise<OhlcCandle[]> {
    const response = await axios.get<{
      error: string[];
      result: Record<string, RawKrakenCandle[]>;
    }>(`${appConfig.krakenBaseUrl}/OHLC`, {
      params: { pair: pairKey, interval: intervalMin },
    });

    if (response.data.error.length > 0) {
      throw new Error(response.data.error.join(", "));
    }

    const candles = response.data.result[pairKey] ?? [];
    return candles.map((raw) => this.toCandle(raw));
  }

  // Live price source backed by Kraken. Throws if a symbol isn't listed.
  public async fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
    if (symbols.length === 0) {
      return {};
    }

    const pairMap = await this.buildPairMap();
    const pairKeyToSymbol: Record<string, string> = {};

    for (const symbol of symbols) {
      const symbolUpper = symbol.toUpperCase();
      const pairKey = pairMap[symbolUpper];
      if (!pairKey) {
        throw new UnsupportedByKrakenError(`${symbolUpper} is not listed on Kraken`);
      }
      pairKeyToSymbol[pairKey] = symbolUpper;
    }

    const response = await axios.get<{
      error: string[];
      result: Record<string, KrakenTickerEntry>;
    }>(`${appConfig.krakenBaseUrl}/Ticker`, {
      params: { pair: Object.keys(pairKeyToSymbol).join(",") },
    });

    if (response.data.error.length > 0) {
      throw new Error(response.data.error.join(", "));
    }

    const prices: Record<string, number> = {};
    for (const [pairKey, ticker] of Object.entries(response.data.result)) {
      const symbol = pairKeyToSymbol[pairKey];
      if (symbol) {
        prices[symbol] = parseFloat(ticker.c[0]);
      }
    }

    return prices;
  }

  // Fetches candlestick data for a coin at the given interval (minutes).
  public async fetchOhlc(symbol: string, intervalMin: number): Promise<OhlcCandle[]> {
    const pairMap = await this.buildPairMap();
    const pairKey = pairMap[symbol.toUpperCase()];
    if (!pairKey) {
      throw new UnsupportedByKrakenError(`${symbol.toUpperCase()} is not listed on Kraken`);
    }

    if ((this.nativeIntervalsMin as readonly number[]).includes(intervalMin)) {
      return this.fetchRawOhlc(pairKey, intervalMin);
    }

    if (intervalMin === 480) {
      const fourHourCandles = await this.fetchRawOhlc(pairKey, 240);
      return this.mergeCandles(fourHourCandles, 2);
    }
    if (intervalMin === 720) {
      const fourHourCandles = await this.fetchRawOhlc(pairKey, 240);
      return this.mergeCandles(fourHourCandles, 3);
    }

    throw new Error(`Unsupported interval: ${intervalMin} minutes`);
  }
}

export const krakenService = new KrakenService();
