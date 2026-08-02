import axios from "axios";
import { appConfig } from "../utils/app-config";

const API_KEY = import.meta.env.VITE_CRYPTOCOMPARE_API_KEY as string | undefined;

export class MissingCryptoCompareKeyError extends Error {}

// Fetches live USD prices for several coin symbols in a single request.
export async function fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
  if (symbols.length === 0) {
    return {};
  }

  if (!API_KEY) {
    throw new MissingCryptoCompareKeyError("VITE_CRYPTOCOMPARE_API_KEY is not set");
  }

  const response = await axios.get<Record<string, { USD: number }>>(appConfig.cryptoCompareBaseUrl, {
    params: {
      fsyms: symbols.join(","),
      tsyms: "usd",
      api_key: API_KEY,
    },
  });

  const prices: Record<string, number> = {};

  for (const symbol of Object.keys(response.data)) {
    prices[symbol] = response.data[symbol].USD;
  }

  return prices;
}

