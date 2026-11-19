import axios from "axios";
import type { CoinDetails, CoinMarket, OhlcCandle } from "../models/coin";
import { appConfig } from "../utils/app-config";

class CoinGeckoService {
  private client = axios.create({
    baseURL: appConfig.coinGeckoBaseUrl,
    headers: appConfig.coinGeckoApiKey
      ? { "x-cg-demo-api-key": appConfig.coinGeckoApiKey }
      : undefined,
  });

  // Top 100 coins by market cap for the home page grid.
  public async fetchTopCoins(): Promise<CoinMarket[]> {
    const response = await this.client.get<CoinMarket[]>("/coins/markets", {
      params: {
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 100,
        page: 1,
        sparkline: false,
      },
    });

    return response.data;
  }

  // Full details for a single coin (More Info panel, AI page).
  public async fetchCoinDetails(coinId: string): Promise<CoinDetails> {
    const response = await this.client.get<CoinDetails>(`/coins/${coinId}`, {
      params: {
        market_data: true,
        localization: false,
        tickers: false,
        community_data: false,
        developer_data: false,
      },
    });

    return response.data;
  }

  // Fallback OHLC source for coins not listed on Kraken.
  public async fetchOhlc(coinId: string, days: number): Promise<OhlcCandle[]> {
    const response = await this.client.get<[number, number, number, number, number][]>(
      `/coins/${coinId}/ohlc`,
      { params: { vs_currency: "usd", days } }
    );

    return response.data.map(([time, open, high, low, close]) => ({
      time,
      open,
      high,
      low,
      close,
    }));
  }
}

export const coinGeckoService = new CoinGeckoService();
