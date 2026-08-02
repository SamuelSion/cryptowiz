import { useEffect, useState } from "react";
import { fetchOhlcKraken, UnsupportedByKrakenError } from "../api/kraken-api";
import { fetchOhlcCoinGecko } from "../api/coingecko-api";
import type { OhlcCandle } from "../types/coin";

const REFRESH_MS = 30_000;

export type CandleStatus = "loading" | "loaded" | "unsupported" | "error";
export type CandleSource = "kraken" | "coingecko-fallback";

export interface CandleCoinRef {
  symbol: string;
  coinId: string;
}

// Candlestick/historical-line data: Kraken first, CoinGecko as fallback.
export function useCandles(
  coin: CandleCoinRef | null,
  intervalMinutes: number,
  maxCandles: number,
  coinGeckoDays: number
) {
  const [candles, setCandles] = useState<OhlcCandle[]>([]);
  const [status, setStatus] = useState<CandleStatus>("loading");
  const [source, setSource] = useState<CandleSource>("kraken");

  useEffect(() => {
    if (!coin) {
      setCandles([]);
      setStatus("loading");
      return;
    }

    let isCancelled = false;
    setStatus("loading");

    async function load() {
      try {
        const raw = await fetchOhlcKraken(coin!.symbol, intervalMinutes);
        if (isCancelled) return;
        setSource("kraken");
        const sliced = maxCandles > 0 ? raw.slice(-maxCandles) : raw;
        setCandles(sliced);
        setStatus("loaded");
      } catch (krakenError) {
        if (isCancelled) return;

        // Only fall back for "not listed on Kraken", not other errors.
        if (!(krakenError instanceof UnsupportedByKrakenError)) {
          setStatus("error");
          return;
        }

        try {
          const fallbackRaw = await fetchOhlcCoinGecko(coin!.coinId, coinGeckoDays);
          if (isCancelled) return;
          setSource("coingecko-fallback");
          const sliced = maxCandles > 0 ? fallbackRaw.slice(-maxCandles) : fallbackRaw;
          setCandles(sliced);
          setStatus(sliced.length > 0 ? "loaded" : "unsupported");
        } catch {
          if (!isCancelled) setStatus("unsupported");
        }
      }
    }

    load();
    const intervalId = window.setInterval(load, REFRESH_MS);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin?.symbol, coin?.coinId, intervalMinutes, maxCandles, coinGeckoDays]);

  return { candles, status, source };
}
