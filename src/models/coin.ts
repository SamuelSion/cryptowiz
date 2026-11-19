// Shape returned by CoinGecko's /coins/markets endpoint (trimmed to what we use).
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
}

// Shape returned by CoinGecko's /coins/<id> endpoint (trimmed to what we use).
export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  market_cap_rank: number | null;
  image: {
    large: string;
  };
  market_data: {
    current_price: {
      usd: number;
      eur: number;
      ils: number;
    };
    market_cap: {
      usd: number;
    };
    total_volume: {
      usd: number;
    };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
    ath: {
      usd: number;
    };
    ath_change_percentage: {
      usd: number;
    };
    price_change_percentage_30d_in_currency: {
      usd: number;
    };
    price_change_percentage_60d_in_currency: {
      usd: number;
    };
    price_change_percentage_200d_in_currency: {
      usd: number;
    };
  };
}

// One OHLC candle for the candlestick chart.
export interface OhlcCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

// One data point in the live-report price history for a single selected coin.
export interface PricePoint {
  timestamp: number;
  prices: Record<string, number>;
}

// Verdict returned from the AI recommendation feature.
export interface AiRecommendation {
  verdict: "buy" | "hold" | "avoid";
  summary: string;
  strengths: string[];
  risks: string[];
  explanation: string;
}
