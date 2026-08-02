import axios from "axios";
import type { CoinDetails, CoinMarket, OhlcCandle } from "../types/coin";
import { appConfig } from "../utils/app-config";

const API_KEY = import.meta.env.VITE_COINGECKO_API_KEY as string | undefined;

// Optional API key, sent as a header (not a query param, to avoid it
// leaking into browser history).
const client = axios.create({
  baseURL: appConfig.coinGeckoBaseUrl,
  headers: API_KEY ? { "x-cg-demo-api-key": API_KEY } : undefined,
});

// Fetches the top 100 coins by market cap for the home page grid.
export async function fetchTopCoins(): Promise<CoinMarket[]> {
  const response = await client.get<CoinMarket[]>("/coins/markets", {
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

// Fetches full details for a single coin (More Info panel, AI page).
export async function fetchCoinDetails(coinId: string): Promise<CoinDetails> {
  const response = await client.get<CoinDetails>(`/coins/${coinId}`, {
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
export async function fetchOhlcCoinGecko(coinId: string, days: number): Promise<OhlcCandle[]> {
  const response = await client.get<[number, number, number, number, number][]>(
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
