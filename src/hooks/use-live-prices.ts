import { useEffect, useState } from "react";
import { fetchLivePrices } from "../api/cryptocompare-api";
import { fetchLivePricesKraken } from "../api/kraken-api";
import { fetchPricesBySymbol } from "../api/coinpaprika-api";
import type { PricePoint } from "../types/coin";

export interface TrackedCoinRef {
  id: string;
  symbol: string;
}

export type LiveSource = "cryptocompare" | "kraken" | "coinpaprika";
export type LiveStatus = "idle" | "loading" | "polling" | "error";

// Live prices: CryptoCompare (optional key) -> Kraken -> CoinPaprika.
function buildTiers(coins: TrackedCoinRef[]) {
  return [
    {
      source: "cryptocompare" as const,
      intervalMs: 1000,
      poll: async () => fetchLivePrices(coins.map((coin) => coin.symbol.toUpperCase())),
    },
    {
      source: "kraken" as const,
      intervalMs: 1000,
      poll: async () => fetchLivePricesKraken(coins.map((coin) => coin.symbol.toUpperCase())),
    },
    {
      source: "coinpaprika" as const,
      intervalMs: 4000,
      poll: async () => fetchPricesBySymbol(coins.map((coin) => coin.symbol.toUpperCase())),
    },
  ];
}

const MAX_HISTORY_POINTS = 60;

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

    let isCancelled = false;
    let intervalId: number | undefined;
    setStatus("loading");
    setHistory([]);

    const tiers = buildTiers(coins);

    function recordPoint(pricesBySymbol: Record<string, number>) {
      if (isCancelled) {
        return;
      }
      setStatus("polling");
      setHistory((previous) => {
        const nextPoint: PricePoint = { timestamp: Date.now(), prices: pricesBySymbol };
        const next = [...previous, nextPoint];
        return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
      });
    }

    async function tryTier(tierIndex: number) {
      if (tierIndex >= tiers.length) {
        if (!isCancelled) setStatus("error");
        return;
      }

      const tier = tiers[tierIndex];
      try {
        const prices = await tier.poll();
        if (isCancelled) return;
        setSource(tier.source);
        recordPoint(prices);
        intervalId = window.setInterval(() => {
          tier.poll().then(recordPoint).catch(() => {
            if (!isCancelled) setStatus("error");
          });
        }, tier.intervalMs);
      } catch {
        if (!isCancelled) {
          await tryTier(tierIndex + 1);
        }
      }
    }

    tryTier(0);

    return () => {
      isCancelled = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinsKey]);

  return { history, status, source };
}
