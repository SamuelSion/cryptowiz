import axios from "axios";
import { appConfig } from "../utils/app-config";







// Cached briefly, since the API returns every coin at once.
let cachedTickers = null;
let cachedAt = 0;
const CACHE_TTL_MS = 4000;

async function getAllTickers() {
  const now = Date.now();
  if (cachedTickers && now - cachedAt < CACHE_TTL_MS) {
    return cachedTickers;
  }
  const response = await axios.get(`${appConfig.coinPaprikaBaseUrl}/tickers`, {
    params: { quotes: "USD" },
  });
  cachedTickers = response.data;
  cachedAt = now;
  return cachedTickers;
}

// Backup live-price source for coins not listed on Kraken.
export async function fetchPricesBySymbol(symbols) {
  if (symbols.length === 0) {
    return {};
  }

  const allTickers = await getAllTickers();
  const wantedSymbols = new Set(symbols.map((symbol) => symbol.toUpperCase()));
  const prices = {};

  for (const ticker of allTickers) {
    const symbolUpper = ticker.symbol.toUpperCase();
    if (wantedSymbols.has(symbolUpper) && !(symbolUpper in prices)) {
      prices[symbolUpper] = ticker.quotes.USD.price;
    }
  }

  return prices;
}
