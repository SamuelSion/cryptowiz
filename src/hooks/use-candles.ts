import { useEffect, useState } from "react";
import { candleService } from "../services/candle-service";
import type { CandleCoinRef, CandleSource } from "../services/candle-service";
import { appConfig } from "../utils/app-config";
import type { OhlcCandle } from "../models/coin";

export type { CandleCoinRef, CandleSource };
export type CandleStatus = "loading" | "loaded" | "unsupported" | "error";

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
        const result = await candleService.fetchCandles(
          coin!,
          intervalMinutes,
          maxCandles,
          coinGeckoDays
        );
        if (isCancelled) return;
        setSource(result.source);
        setCandles(result.candles);
        setStatus(result.candles.length > 0 ? "loaded" : "unsupported");
      } catch {
        if (!isCancelled) setStatus("unsupported");
      }
    }

    load();
    const intervalId = window.setInterval(load, appConfig.candleRefreshIntervalMs);

    return () => {
      isCancelled = true;
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coin?.symbol, coin?.coinId, intervalMinutes, maxCandles, coinGeckoDays]);

  return { candles, status, source };
}
