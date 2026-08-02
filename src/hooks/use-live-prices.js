import { useEffect, useState } from "react";
import { fetchLivePrices } from "../api/cryptocompare-api";
import { fetchLivePricesKraken } from "../api/kraken-api";
import { fetchPricesBySymbol } from "../api/coinpaprika-api";

// Live prices: CryptoCompare (optional key) -> Kraken -> CoinPaprika.
function buildTiers(coins) {
  return [
    {
      source: "cryptocompare" ,
      intervalMs: 1000,
      poll: async () => fetchLivePrices(coins.map((coin) => coin.symbol.toUpperCase())),
    },
    {
      source: "kraken" ,
      intervalMs: 1000,
      poll: async () => fetchLivePricesKraken(coins.map((coin) => coin.symbol.toUpperCase())),
    },
    {
      source: "coinpaprika" ,
      intervalMs: 4000,
      poll: async () => fetchPricesBySymbol(coins.map((coin) => coin.symbol.toUpperCase())),
    },
  ];
}

const MAX_HISTORY_POINTS = 60;

export function useLivePrices(coins) {
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("idle");
  const [source, setSource] = useState("kraken");
  const coinsKey = coins.map((coin) => coin.id).join(",");

  useEffect(() => {
    if (coins.length === 0) {
      setHistory([]);
      setStatus("idle");
      return;
    }

    let isCancelled = false;
    let intervalId;
    setStatus("loading");
    setHistory([]);

    const tiers = buildTiers(coins);

    function recordPoint(pricesBySymbol) {
      if (isCancelled) {
        return;
      }
      setStatus("polling");
      setHistory((previous) => {
        const nextPoint = { timestamp: Date.now(), prices: pricesBySymbol };
        const next = [...previous, nextPoint];
        return next.length > MAX_HISTORY_POINTS ? next.slice(-MAX_HISTORY_POINTS) : next;
      });
    }

    async function tryTier(tierIndex) {
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
      } catch (e) {
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
