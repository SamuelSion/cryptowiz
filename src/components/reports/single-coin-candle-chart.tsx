import CandlestickChart from "../coins/candlestick-chart";
import type { CoinMarket, OhlcCandle } from "../../models/coin";
import type { CandleStatus, CandleSource } from "../../hooks/use-candles";
import { formatFullDate } from "../../utils/format-date";
import styles from "../../pages/reports-page.module.css";

interface SingleCoinCandleChartProps {
  focusCoin: CoinMarket | null;
  status: CandleStatus;
  source: CandleSource;
  candles: OhlcCandle[];
  timeLabelFormatter: (timeMs: number) => string;
  isMonthInterval: boolean;
}

export default function SingleCoinCandleChart({
  focusCoin,
  status,
  source,
  candles,
  timeLabelFormatter,
  isMonthInterval,
}: SingleCoinCandleChartProps) {
  if (status === "loading") {
    return <p className={styles.statusMessage}>טוען נתוני נרות...</p>;
  }
  if (status === "unsupported" && focusCoin) {
    return (
      <p className={styles.statusMessage}>
        לא הצלחנו למצוא נתוני נרות עבור {focusCoin.name} (לא ב-Kraken ולא ב-CoinGecko). נסו מטבע
        אחר, או עברו לתצוגת קו.
      </p>
    );
  }
  if (status === "error") {
    return <p className={styles.statusMessage}>שגיאה בטעינת נתוני הנרות. נסו שוב בעוד רגע.</p>;
  }
  if (status !== "loaded" || candles.length === 0) {
    return null;
  }

  return (
    <>
      {source === "coingecko-fallback" && (
        <p className={styles.fallbackNote}>
          {focusCoin?.name} לא נסחר ב-Kraken - הנתונים כאן מגיעים מ-CoinGecko (רזולוציה קצת שונה
          מהרגילה).
        </p>
      )}
      <CandlestickChart
        candles={candles}
        timeLabelFormatter={timeLabelFormatter}
        fullDateFormatter={(timeMs) => formatFullDate(timeMs, !isMonthInterval)}
      />
    </>
  );
}
