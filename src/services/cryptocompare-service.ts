import axios from "axios";
import { appConfig } from "../utils/app-config";

export class MissingCryptoCompareKeyError extends Error {}

class CryptoCompareService {
  // Fetches live USD prices for several coin symbols in a single request.
  public async fetchLivePrices(symbols: string[]): Promise<Record<string, number>> {
    if (symbols.length === 0) {
      return {};
    }

    if (!appConfig.cryptoCompareApiKey) {
      throw new MissingCryptoCompareKeyError("VITE_CRYPTOCOMPARE_API_KEY is not set");
    }

    const response = await axios.get<Record<string, { USD: number }>>(
      appConfig.cryptoCompareBaseUrl,
      {
        params: {
          fsyms: symbols.join(","),
          tsyms: "usd",
          api_key: appConfig.cryptoCompareApiKey,
        },
      }
    );

    const prices: Record<string, number> = {};

    for (const symbol of Object.keys(response.data)) {
      prices[symbol] = response.data[symbol].USD;
    }

    return prices;
  }
}

export const cryptoCompareService = new CryptoCompareService();
