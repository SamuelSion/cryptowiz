import { krakenService, UnsupportedByKrakenError } from "./kraken-service";
import { coinGeckoService } from "./coingecko-service";
import type { OhlcCandle } from "../models/coin";

export type CandleSource = "kraken" | "coingecko-fallback";

export interface CandleCoinRef {
  symbol: string;
  coinId: string;
}

export interface CandleResult {
  candles: OhlcCandle[];
  source: CandleSource;
}

class CandleService {
  // Fetches candlestick data: Kraken first, CoinGecko as a fallback for
  // coins Kraken doesn't list. Throws only when both sources fail.
  public async fetchCandles(
    coin: CandleCoinRef,
    intervalMinutes: number,
    maxCandles: number,
    coinGeckoDays: number
  ): Promise<CandleResult> {
    try {
      const raw = await krakenService.fetchOhlc(coin.symbol, intervalMinutes);
      return { candles: this.trim(raw, maxCandles), source: "kraken" };
    } catch (krakenError) {
      if (!(krakenError instanceof UnsupportedByKrakenError)) {
        throw krakenError;
      }

      const fallbackRaw = await coinGeckoService.fetchOhlc(coin.coinId, coinGeckoDays);
      return { candles: this.trim(fallbackRaw, maxCandles), source: "coingecko-fallback" };
    }
  }

  private trim(candles: OhlcCandle[], maxCandles: number): OhlcCandle[] {
    return maxCandles > 0 ? candles.slice(-maxCandles) : candles;
  }
}

export const candleService = new CandleService();
