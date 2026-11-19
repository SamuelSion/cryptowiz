import { cryptoCompareService } from "./cryptocompare-service";
import { krakenService } from "./kraken-service";
import { coinPaprikaService } from "./coinpaprika-service";
import { appConfig } from "../utils/app-config";

export interface TrackedCoinRef {
  id: string;
  symbol: string;
}

export type LiveSource = "cryptocompare" | "kraken" | "coinpaprika";

interface Tier {
  source: LiveSource;
  intervalMs: number;
  poll: () => Promise<Record<string, number>>;
}

// Live prices: CryptoCompare (optional key) -> Kraken -> CoinPaprika.
class LivePriceService {
  private buildTiers(coins: TrackedCoinRef[]): Tier[] {
    const symbols = () => coins.map((coin) => coin.symbol.toUpperCase());

    return [
      {
        source: "cryptocompare",
        intervalMs: appConfig.livePricePollIntervalMs,
        poll: () => cryptoCompareService.fetchLivePrices(symbols()),
      },
      {
        source: "kraken",
        intervalMs: appConfig.livePricePollIntervalMs,
        poll: () => krakenService.fetchLivePrices(symbols()),
      },
      {
        source: "coinpaprika",
        intervalMs: appConfig.coinPaprikaPollIntervalMs,
        poll: () => coinPaprikaService.fetchPricesBySymbol(symbols()),
      },
    ];
  }

  // Subscribes to live prices for the given coins, trying each tier in
  // order until one works. Returns an unsubscribe function.
  public subscribe(
    coins: TrackedCoinRef[],
    onUpdate: (prices: Record<string, number>, source: LiveSource) => void,
    onError: () => void
  ): () => void {
    let isCancelled = false;
    let intervalId: number | undefined;
    const tiers = this.buildTiers(coins);

    const tryTier = async (tierIndex: number): Promise<void> => {
      if (tierIndex >= tiers.length) {
        if (!isCancelled) onError();
        return;
      }

      const tier = tiers[tierIndex];
      try {
        const prices = await tier.poll();
        if (isCancelled) return;
        onUpdate(prices, tier.source);
        intervalId = window.setInterval(() => {
          tier
            .poll()
            .then((nextPrices) => onUpdate(nextPrices, tier.source))
            .catch(() => {
              if (!isCancelled) onError();
            });
        }, tier.intervalMs);
      } catch {
        if (!isCancelled) {
          await tryTier(tierIndex + 1);
        }
      }
    };

    tryTier(0);

    return () => {
      isCancelled = true;
      if (intervalId !== undefined) {
        window.clearInterval(intervalId);
      }
    };
  }
}

export const livePriceService = new LivePriceService();
