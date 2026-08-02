export interface IntervalOption {
  id: string;
  label: string;
  // null = live tick-by-tick, not a candle interval.
  krakenMinutes: number | null;
  maxCandles: number;
  // Fallback "days" window for CoinGecko's OHLC endpoint (best-effort
  // match, since it doesn't take an exact interval like Kraken).
  coinGeckoDays: number;
}

// "1m".."12h" are candle sizes. "1d"/"7d"/"1M" are range presets.
export const INTERVAL_OPTIONS: IntervalOption[] = [
  { id: "live", label: "שנייה (חי)", krakenMinutes: null, maxCandles: 0, coinGeckoDays: 0 },
  { id: "1m", label: "דקה", krakenMinutes: 1, maxCandles: 120, coinGeckoDays: 1 },
  { id: "5m", label: "5 דקות", krakenMinutes: 5, maxCandles: 120, coinGeckoDays: 1 },
  { id: "30m", label: "חצי שעה", krakenMinutes: 30, maxCandles: 120, coinGeckoDays: 1 },
  { id: "1h", label: "שעה", krakenMinutes: 60, maxCandles: 120, coinGeckoDays: 1 },
  { id: "4h", label: "4 שעות", krakenMinutes: 240, maxCandles: 120, coinGeckoDays: 7 },
  { id: "8h", label: "8 שעות", krakenMinutes: 480, maxCandles: 90, coinGeckoDays: 14 },
  { id: "12h", label: "12 שעות", krakenMinutes: 720, maxCandles: 60, coinGeckoDays: 14 },
  { id: "1d", label: "יום", krakenMinutes: 60, maxCandles: 24, coinGeckoDays: 1 },
  { id: "7d", label: "7 ימים", krakenMinutes: 240, maxCandles: 42, coinGeckoDays: 7 },
  { id: "1M", label: "חודש", krakenMinutes: 1440, maxCandles: 30, coinGeckoDays: 30 },
];
