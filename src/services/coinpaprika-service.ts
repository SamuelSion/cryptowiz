import axios from "axios";
import { appConfig } from "../utils/app-config";

interface PaprikaTicker {
  symbol: string;
  rank: number;
  quotes: { USD: { price: number } };
}

class CoinPaprikaService {
  // Cached briefly, since the API returns every coin at once.
  private cachedTickers: PaprikaTicker[] | null = null;
  private cachedAt = 0;
  private readonly cacheTtlMs = appConfig.coinPaprikaCacheTtlMs;

  private async getAllTickers(): Promise<PaprikaTicker[]> {
    const now = Date.now();
    if (this.cachedTickers && now - this.cachedAt < this.cacheTtlMs) {
      return this.cachedTickers;
    }
    const response = await axios.get<PaprikaTicker[]>(`${appConfig.coinPaprikaBaseUrl}/tickers`, {
      params: { quotes: "USD" },
    });
    this.cachedTickers = response.data;
    this.cachedAt = now;
    return this.cachedTickers;
  }

  // Backup live-price source for coins not listed on Kraken.
  public async fetchPricesBySymbol(symbols: string[]): Promise<Record<string, number>> {
    if (symbols.length === 0) {
      return {};
    }

    const allTickers = await this.getAllTickers();
    const wantedSymbols = new Set(symbols.map((symbol) => symbol.toUpperCase()));
    const prices: Record<string, number> = {};

    for (const ticker of allTickers) {
      const symbolUpper = ticker.symbol.toUpperCase();
      if (wantedSymbols.has(symbolUpper) && !(symbolUpper in prices)) {
        prices[symbolUpper] = ticker.quotes.USD.price;
      }
    }

    return prices;
  }
}

export const coinPaprikaService = new CoinPaprikaService();
