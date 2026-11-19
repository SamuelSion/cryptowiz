import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CoinMarket } from "../../models/coin";
import type { LiveStatus, LiveSource } from "../../hooks/use-live-prices";
import { formatPriceTick } from "../../utils/format-price";
import { formatFullDate } from "../../utils/format-date";
import styles from "../../pages/reports-page.module.css";

const LINE_COLORS = ["#39ff8a", "#ffb020", "#4ea1ff", "#ff5d8f", "#c792ff"];

interface AllCoinsLiveChartProps {
  trackedCoins: CoinMarket[];
  allSymbols: string[];
  chartData: Array<Record<string, number | string>>;
  status: LiveStatus;
  source: LiveSource;
}

export default function AllCoinsLiveChart({
  trackedCoins,
  allSymbols,
  chartData,
  status,
  source,
}: AllCoinsLiveChartProps) {
  return (
    <>
      <p className="page-subheading">
        המחירים מתעדכנים בבקשה אחת בודדת עבור כל המטבעות שסימנתם, במחיר דולר (USD).
        {source === "kraken" && " (עדכון כל שנייה ישירות מבורסת Kraken - ללא מפתח)"}
        {source === "cryptocompare" && " (עדכון כל שנייה דרך CryptoCompare)"}
        {source === "coinpaprika" &&
          " (עדכון כל 4 שניות דרך CoinPaprika - אחד מהמטבעות שסימנתם לא נסחר ב-Kraken)"}
      </p>

      <div className={styles.chips}>
        {trackedCoins.map((coin, index) => (
          <span
            key={coin.id}
            className={`${styles.chip} ${styles[`chipColor${index % LINE_COLORS.length}`]}`}
          >
            <span className={`${styles.chipDot} ${styles[`dotColor${index % LINE_COLORS.length}`]}`} />
            {coin.name}
          </span>
        ))}
      </div>

      {status === "error" ? (
        <div className={styles.chartCard}>
          <p className={styles.statusMessage}>שגיאה בטעינת המחירים החיים. נסו לרענן את הדף בעוד רגע.</p>
        </div>
      ) : (
        <div className={styles.chartCard}>
          <div className={styles.chartInner} dir="ltr">
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 8, left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fill: "var(--text-secondary)", fontSize: 12.5 }}
                  tickLine={{ stroke: "var(--text-tertiary)" }}
                  axisLine={{ stroke: "var(--border-strong)" }}
                  scale="log"
                  domain={["auto", "auto"]}
                  allowDataOverflow={false}
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
                      ? formatFullDate(payload[0].payload.fullTime, true)
                      : ""
                  }
                />
                <Legend />
                {allSymbols.map((symbol, index) => (
                  <Line
                    key={symbol}
                    type="monotone"
                    dataKey={symbol}
                    stroke={LINE_COLORS[index % LINE_COLORS.length]}
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </>
  );
}
