import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CoinMarket } from "../../models/coin";
import type { LiveStatus } from "../../hooks/use-live-prices";
import type { CandleStatus, CandleSource } from "../../hooks/use-candles";
import { formatPriceTick } from "../../utils/format-price";
import { formatFullDate } from "../../utils/format-date";
import styles from "../../pages/reports-page.module.css";

const LINE_COLOR = "#39ff8a";

interface SingleCoinLineChartProps {
  focusCoin: CoinMarket | null;
  isLive: boolean;
  liveStatus: LiveStatus;
  liveChartData: Array<{ time: string; fullTime: number; price: number | undefined }>;
  candleStatus: CandleStatus;
  candleSource: CandleSource;
  historicalChartData: Array<{ time: string; fullTime: number; price: number }>;
  isMonthInterval: boolean;
}

export default function SingleCoinLineChart({
  focusCoin,
  isLive,
  liveStatus,
  liveChartData,
  candleStatus,
  candleSource,
  historicalChartData,
  isMonthInterval,
}: SingleCoinLineChartProps) {
  if (isLive) {
    if (liveStatus === "error") {
      return (
        <p className={styles.statusMessage}>שגיאה בטעינת המחירים החיים. נסו לרענן את הדף בעוד רגע.</p>
      );
    }
    return <LineChartInner data={liveChartData} coinName={focusCoin?.name} includeTime />;
  }

  if (candleStatus === "loading") {
    return <p className={styles.statusMessage}>טוען נתוני מחיר...</p>;
  }
  if (candleStatus === "unsupported" && focusCoin) {
    return (
      <p className={styles.statusMessage}>
        לא הצלחנו למצוא היסטוריית מחיר עבור {focusCoin.name} (לא ב-Kraken ולא ב-CoinGecko). נסו
        מטבע אחר, או עברו לתצוגת "חי".
      </p>
    );
  }
  if (candleStatus === "error") {
    return <p className={styles.statusMessage}>שגיאה בטעינת נתוני המחיר. נסו שוב בעוד רגע.</p>;
  }

  return (
    <>
      {candleSource === "coingecko-fallback" && (
        <p className={styles.fallbackNote}>
          {focusCoin?.name} לא נסחר ב-Kraken - הנתונים כאן מגיעים מ-CoinGecko (רזולוציה קצת שונה
          מהרגילה).
        </p>
      )}
      <LineChartInner
        data={historicalChartData}
        coinName={focusCoin?.name}
        includeTime={!isMonthInterval}
      />
    </>
  );
}

function LineChartInner({
  data,
  coinName,
  includeTime,
}: {
  data: Array<{ time: string; fullTime: number; price: number | undefined }>;
  coinName: string | undefined;
  includeTime: boolean;
}) {
  return (
    <div className={styles.chartInner} dir="ltr">
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={data} margin={{ top: 12, right: 24, bottom: 8, left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} minTickGap={24} />
          <YAxis
            stroke="var(--text-secondary)"
            tick={{ fill: "var(--text-secondary)", fontSize: 12.5 }}
            tickLine={{ stroke: "var(--text-tertiary)" }}
            axisLine={{ stroke: "var(--border-strong)" }}
            domain={["auto", "auto"]}
            width={80}
            tickFormatter={formatPriceTick}
          />
          <Tooltip
            contentStyle={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-strong)",
              borderRadius: 10,
            }}
            labelStyle={{ color: "var(--text-secondary)" }}
            formatter={(value) => formatPriceTick(Number(value))}
            labelFormatter={(_label, payload) =>
              payload?.[0]?.payload?.fullTime
                ? formatFullDate(payload[0].payload.fullTime, includeTime)
                : ""
            }
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke={LINE_COLOR}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
            connectNulls
            name={coinName}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
