 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import axios from "axios";

import { appConfig } from "../utils/app-config";

// Kraken uses different symbols for a couple of legacy assets.
const SYMBOL_OVERRIDES = {
  XBT: "BTC",
  XDG: "DOGE",
};

// symbol -> Kraken pair identifier (e.g. "BTC" -> "XXBTZUSD").
let cachedPairMap = null;
let cachedAt = 0;
const CACHE_TTL_MS = 10 * 60 * 1000;

async function buildPairMap() {
  const now = Date.now();
  if (cachedPairMap && now - cachedAt < CACHE_TTL_MS) {
    return cachedPairMap;
  }

  const [assetsResponse, pairsResponse] = await Promise.all([
    axios.get(`${appConfig.krakenBaseUrl}/Assets`),
    axios.get(`${appConfig.krakenBaseUrl}/AssetPairs`),
  ]);

  const assetAltnames = {};
  for (const [assetKey, asset] of Object.entries(assetsResponse.data.result)) {
    assetAltnames[assetKey] = asset.altname;
  }

  const map = {};
  for (const [pairKey, pair] of Object.entries(pairsResponse.data.result)) {
    const quoteAltname = _nullishCoalesce(assetAltnames[pair.quote], () => ( pair.quote));
    if (quoteAltname !== "USD") {
      continue;
    }
    const baseAltname = _nullishCoalesce(assetAltnames[pair.base], () => ( pair.base));
    const symbol = (_nullishCoalesce(SYMBOL_OVERRIDES[baseAltname], () => ( baseAltname))).toUpperCase();

    // Keep the first match if a symbol maps to more than one USD pair.
    if (!(symbol in map)) {
      map[symbol] = pairKey;
    }
  }

  cachedPairMap = map;
  cachedAt = now;
  return map;
}

export class UnsupportedByKrakenError extends Error {}

// Live price source backed by Kraken. Throws if a symbol isn't listed.
export async function fetchLivePricesKraken(symbols) {
  if (symbols.length === 0) {
    return {};
  }

  const pairMap = await buildPairMap();
  const pairKeyToSymbol = {};

  for (const symbol of symbols) {
    const symbolUpper = symbol.toUpperCase();
    const pairKey = pairMap[symbolUpper];
    if (!pairKey) {
      throw new UnsupportedByKrakenError(`${symbolUpper} is not listed on Kraken`);
    }
    pairKeyToSymbol[pairKey] = symbolUpper;
  }

  const response = await axios.get


(`${appConfig.krakenBaseUrl}/Ticker`, {
    params: { pair: Object.keys(pairKeyToSymbol).join(",") },
  });

  if (response.data.error.length > 0) {
    throw new Error(response.data.error.join(", "));
  }

  const prices = {};
  for (const [pairKey, ticker] of Object.entries(response.data.result)) {
    const symbol = pairKeyToSymbol[pairKey];
    if (symbol) {
      prices[symbol] = parseFloat(ticker.c[0]);
    }
  }

  return prices;
}

// Kraken's native OHLC interval sizes (minutes). 480 and 720 aren't
// supported, so those are built by merging 240-minute candles.
const NATIVE_INTERVALS_MIN = [1, 5, 15, 30, 60, 240, 1440, 10080, 21600] ;









function toCandle(raw) {
  return {
    time: raw[0] * 1000,
    open: parseFloat(raw[1]),
    high: parseFloat(raw[2]),
    low: parseFloat(raw[3]),
    close: parseFloat(raw[4]),
  };
}

// Merges every `factor` consecutive candles into one.
function mergeCandles(candles, factor) {
  const merged = [];
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

async function fetchRawOhlc(pairKey, intervalMin) {
  const response = await axios.get


(`${appConfig.krakenBaseUrl}/OHLC`, {
    params: { pair: pairKey, interval: intervalMin },
  });

  if (response.data.error.length > 0) {
    throw new Error(response.data.error.join(", "));
  }

  const candles = _nullishCoalesce(response.data.result[pairKey], () => ( []));
  return candles.map(toCandle);
}

// Fetches candlestick data for a coin at the given interval (minutes).
export async function fetchOhlcKraken(
  symbol,
  intervalMin
) {
  const pairMap = await buildPairMap();
  const pairKey = pairMap[symbol.toUpperCase()];
  if (!pairKey) {
    throw new UnsupportedByKrakenError(`${symbol.toUpperCase()} is not listed on Kraken`);
  }

  if ((NATIVE_INTERVALS_MIN ).includes(intervalMin)) {
    return fetchRawOhlc(pairKey, intervalMin);
  }

  if (intervalMin === 480) {
    const fourHourCandles = await fetchRawOhlc(pairKey, 240);
    return mergeCandles(fourHourCandles, 2);
  }
  if (intervalMin === 720) {
    const fourHourCandles = await fetchRawOhlc(pairKey, 240);
    return mergeCandles(fourHourCandles, 3);
  }

  throw new Error(`Unsupported interval: ${intervalMin} minutes`);
}
