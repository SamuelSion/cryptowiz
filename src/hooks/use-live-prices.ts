import { useEffect, useState } from "react";
import { livePriceService } from "../services/live-price-service";
import type { LiveSource, TrackedCoinRef } from "../services/live-price-service";
import { appConfig } from "../utils/app-config";
import type { PricePoint } from "../models/coin";

export type { TrackedCoinRef, LiveSource };
export type LiveStatus = "idle" | "loading" | "polling" | "error";

export function useLivePrices(coins: TrackedCoinRef[]) {
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [status, setStatus] = useState<LiveStatus>("idle");
  const [source, setSource] = useState<LiveSource>("kraken");
  const coinsKey = coins.map((coin) => coin.id).join(",");

  useEffect(() => {
    if (coins.length === 0) {
      setHistory([]);
      setStatus("idle");
      return;
    }

    setStatus("loading");
    setHistory([]);

    const unsubscribe = livePriceService.subscribe(
      coins,
      (prices, tierSource) => {
        setStatus("polling");
        setSource(tierSource);
        setHistory((previous) => {
          const nextPoint: PricePoint = { timestamp: Date.now(), prices };
          const next = [...previous, nextPoint];
          return next.length > appConfig.maxLiveHistoryPoints
            ? next.slice(-appConfig.maxLiveHistoryPoints)
            : next;
        });
      },
      () => setStatus("error")
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinsKey]);

  return { history, status, source };
}
