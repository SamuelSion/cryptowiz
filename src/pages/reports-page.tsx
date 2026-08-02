import { useEffect, useMemo, useState } from "react";
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
import { useAppSelector } from "../store/hooks";
import { coinsService } from "../services/coins-service";
import { useLivePrices } from "../hooks/use-live-prices";
import { useCandles } from "../hooks/use-candles";
import { INTERVAL_OPTIONS } from "../constants/report-intervals";
import CandlestickChart from "../components/coins/candlestick-chart";
import { formatPriceTick } from "../utils/format-price";
import { formatFullDate } from "../utils/format-date";
import styles from "./reports-page.module.css";

const LINE_COLORS = ["#39ff8a", "#ffb020", "#4ea1ff", "#ff5d8f", "#c792ff"];

type ViewMode = "all-live" | "single";
type SingleStyle = "line" | "candles";

export default function ReportsPage() {
  const { items: allCoins } = useAppSelector((state) => state.coins);
  const selectedIds = useAppSelector((state) => state.selectedCoins.ids);

  const [viewMode, setViewMode] = useState<ViewMode>("all-live");
  const [singleStyle, setSingleStyle] = useState<SingleStyle>("line");
  const [intervalId, setIntervalId] = useState<string>("live");
  const [focusCoinId, setFocusCoinId] = useState<string | null>(null);

  useEffect(() => {
    coinsService.loadTopCoins();
  }, []);

  const trackedCoins = useMemo(
    () => allCoins.filter((coin) => selectedIds.includes(coin.id)),
    [allCoins, selectedIds]
  );

  // Keep the focused coin valid as the tracked list changes.
  useEffect(() => {
    if (trackedCoins.length === 0) {
      setFocusCoinId(null);
      return;
    }
    if (!focusCoinId || !trackedCoins.some((coin) => coin.id === focusCoinId)) {
      setFocusCoinId(trackedCoins[0].id);
    }
  }, [trackedCoins, focusCoinId]);

  function handleStyleChange(nextStyle: SingleStyle) {
    setSingleStyle(nextStyle);
    // Candlesticks need a real interval - "live" is only meaningful for a
    // running line, not a candle size.
    if (nextStyle === "candles" && intervalId === "live") {
      setIntervalId("1h");
    }
  }

  // --- "All coins, live" mode ---
  const trackedCoinRefs = useMemo(
    () => trackedCoins.map((coin) => ({ id: coin.id, symbol: coin.symbol })),
    [trackedCoins]
  );
  const allSymbols = useMemo(() => trackedCoins.map((coin) => coin.symbol.toUpperCase()), [
    trackedCoins,
  ]);
  const { history: allHistory, status: allStatus, source: allSource } = useLivePrices(
    viewMode === "all-live" ? trackedCoinRefs : []
  );

  const allLiveChartData = useMemo(
    () =>
      allHistory.map((point) => {
        const row: Record<string, number | string> = {
          time: new Date(point.timestamp).toLocaleTimeString("he-IL"),
          fullTime: point.timestamp,
        };
        for (const symbol of allSymbols) {
          if (point.prices[symbol] !== undefined) {
            row[symbol] = point.prices[symbol];
          }
        }
        return row;
      }),
    [allHistory, allSymbols]
  );

  // --- "Single coin" mode ---
  const focusCoin = trackedCoins.find((coin) => coin.id === focusCoinId) ?? null;
  const focusCoinRef = useMemo(
    () => (focusCoin ? [{ id: focusCoin.id, symbol: focusCoin.symbol }] : []),
    [focusCoin]
  );
  const isSingleLive = viewMode === "single" && intervalId === "live";
  const { history: singleHistory, status: singleLiveStatus } = useLivePrices(
    isSingleLive ? focusCoinRef : []
  );
  const singleLiveChartData = useMemo(
    () =>
      focusCoin
        ? singleHistory.map((point) => ({
            time: new Date(point.timestamp).toLocaleTimeString("he-IL"),
            fullTime: point.timestamp,
            price: point.prices[focusCoin.symbol.toUpperCase()],
          }))
        : [],
    [singleHistory, focusCoin]
  );

  const selectedInterval =
    INTERVAL_OPTIONS.find((option) => option.id === intervalId) ?? INTERVAL_OPTIONS[0];
  const isHistorical = viewMode === "single" && selectedInterval.krakenMinutes !== null;
  const candleCoinRef = useMemo(
    () => (focusCoin ? { symbol: focusCoin.symbol, coinId: focusCoin.id } : null),
    [focusCoin]
  );
  const { candles, status: candleStatus, source: candleSource } = useCandles(
    isHistorical ? candleCoinRef : null,
    selectedInterval.krakenMinutes ?? 60,
    selectedInterval.maxCandles,
    selectedInterval.coinGeckoDays
  );

  const candleTimeFormatter = useMemo(() => {
    const timeOnlyIntervals = new Set(["1m", "5m", "30m", "1h", "1d"]);
    const dateAndHourIntervals = new Set(["4h", "8h", "12h", "7d"]);
    return (timeMs: number) => {
      if (timeOnlyIntervals.has(selectedInterval.id)) {
        return new Date(timeMs).toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
      }
      if (dateAndHourIntervals.has(selectedInterval.id)) {
        return new Date(timeMs).toLocaleString("he-IL", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
        });
      }
      return new Date(timeMs).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit" });
    };
  }, [selectedInterval.id]);

  const historicalLineData = useMemo(
    () =>
      candles.map((candle) => ({
        time: candleTimeFormatter(candle.time),
        fullTime: candle.time,
        price: candle.close,
      })),
    [candles, candleTimeFormatter]
  );

  return (
    <div className="page-container">
      <h2 className="page-heading">דו״ח זמן אמת</h2>
      <p className="page-subheading">
        המחירים מתעדכנים בבקשה אחת בודדת עבור כל המטבעות שסימנתם, במחיר דולר (USD).
        {viewMode === "all-live" &&
          allSource === "kraken" &&
          " (עדכון כל שנייה ישירות מבורסת Kraken - ללא מפתח)"}
        {viewMode === "all-live" &&
          allSource === "cryptocompare" &&
          " (עדכון כל שנייה דרך CryptoCompare)"}
        {viewMode === "all-live" &&
          allSource === "coinpaprika" &&
          " (עדכון כל 4 שניות דרך CoinPaprika - אחד מהמטבעות שסימנתם לא נסחר ב-Kraken)"}
      </p>

      {trackedCoins.length === 0 ? (
        <div className={styles.emptyState}>
          <p>עדיין לא סימנתם מטבעות למעקב.</p>
          <p className={styles.emptyHint}>
            עברו לדף הבית והפעילו את המתג על עד 5 מטבעות כדי לראות כאן דו״ח חי.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.controlsRow}>
            <div className={styles.chartTypeToggle} role="tablist" aria-label="מצב תצוגה">
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "all-live"}
                className={`${styles.toggleButton} ${
                  viewMode === "all-live" ? styles.toggleButtonActive : ""
                }`}
                onClick={() => setViewMode("all-live")}
              >
                כל המטבעות (חי)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={viewMode === "single"}
                className={`${styles.toggleButton} ${
                  viewMode === "single" ? styles.toggleButtonActive : ""
                }`}
                onClick={() => setViewMode("single")}
              >
                מטבע בודד
              </button>
            </div>

            {viewMode === "single" && trackedCoins.length > 1 && (
              <select
                className={styles.coinSelect}
                value={focusCoinId ?? ""}
                onChange={(event) => setFocusCoinId(event.target.value)}
                aria-label="בחר מטבע למיקוד"
              >
                {trackedCoins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))}
              </select>
            )}

            {viewMode === "single" && (
              <div className={styles.chartTypeToggle} role="tablist" aria-label="סגנון תרשים">
                <button
                  type="button"
                  role="tab"
                  aria-selected={singleStyle === "line"}
                  className={`${styles.toggleButton} ${
                    singleStyle === "line" ? styles.toggleButtonActive : ""
                  }`}
                  onClick={() => handleStyleChange("line")}
                >
                  קו
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={singleStyle === "candles"}
                  className={`${styles.toggleButton} ${
                    singleStyle === "candles" ? styles.toggleButtonActive : ""
                  }`}
                  onClick={() => handleStyleChange("candles")}
                >
                  נרות יפניים
                </button>
              </div>
            )}
          </div>

          {viewMode === "single" && (
            <div className={styles.intervalRow} role="tablist" aria-label="טווח זמן">
              {INTERVAL_OPTIONS.filter(
                (option) => singleStyle === "line" || option.krakenMinutes !== null
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="tab"
                  aria-selected={intervalId === option.id}
                  className={`${styles.intervalButton} ${
                    intervalId === option.id ? styles.intervalButtonActive : ""
                  }`}
                  onClick={() => setIntervalId(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {viewMode === "all-live" && (
            <>
              <div className={styles.chips}>
                {trackedCoins.map((coin, index) => (
                  <span
                    key={coin.id}
                    className={`${styles.chip} ${styles[`chipColor${index % LINE_COLORS.length}`]}`}
                  >
                    <span
                      className={`${styles.chipDot} ${styles[`dotColor${index % LINE_COLORS.length}`]}`}
                    />
                    {coin.name}
                  </span>
                ))}
              </div>

              {allStatus === "error" ? (
                <div className={styles.chartCard}>
                  <p className={styles.statusMessage}>
                    שגיאה בטעינת המחירים החיים. נסו לרענן את הדף בעוד רגע.
                  </p>
                </div>
              ) : (
                <div className={styles.chartCard}>
                  <div className={styles.chartInner} dir="ltr">
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart
                        data={allLiveChartData}
                        margin={{ top: 12, right: 24, bottom: 8, left: 12 }}
                      >
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
          )}

          {viewMode === "single" && singleStyle === "line" && (
            <div className={styles.chartCard}>
              {intervalId === "live" ? (
                singleLiveStatus === "error" ? (
                  <p className={styles.statusMessage}>
                    שגיאה בטעינת המחירים החיים. נסו לרענן את הדף בעוד רגע.
                  </p>
                ) : (
                  <div className={styles.chartInner} dir="ltr">
                    <ResponsiveContainer width="100%" height={420}>
                      <LineChart
                        data={singleLiveChartData}
                        margin={{ top: 12, right: 24, bottom: 8, left: 12 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="time" stroke="var(--text-tertiary)" fontSize={12} />
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
                              ? formatFullDate(payload[0].payload.fullTime, true)
                              : ""
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke={LINE_COLORS[0]}
                          dot={false}
                          strokeWidth={2}
                          isAnimationActive={false}
                          connectNulls
                          name={focusCoin?.name}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )
              ) : candleStatus === "loading" ? (
                <p className={styles.statusMessage}>טוען נתוני מחיר...</p>
              ) : candleStatus === "unsupported" && focusCoin ? (
                <p className={styles.statusMessage}>
                  לא הצלחנו למצוא היסטוריית מחיר עבור {focusCoin.name} (לא ב-Kraken ולא
                  ב-CoinGecko). נסו מטבע אחר, או עברו לתצוגת "חי".
                </p>
              ) : candleStatus === "error" ? (
                <p className={styles.statusMessage}>שגיאה בטעינת נתוני המחיר. נסו שוב בעוד רגע.</p>
              ) : (
                <>
                  {candleSource === "coingecko-fallback" && (
                    <p className={styles.fallbackNote}>
                      {focusCoin?.name} לא נסחר ב-Kraken - הנתונים כאן מגיעים מ-CoinGecko
                      (רזולוציה קצת שונה מהרגילה).
                    </p>
                  )}
                  <div className={styles.chartInner} dir="ltr">
                  <ResponsiveContainer width="100%" height={420}>
                    <LineChart
                      data={historicalLineData}
                      margin={{ top: 12, right: 24, bottom: 8, left: 12 }}
                    >
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
                            ? formatFullDate(payload[0].payload.fullTime, selectedInterval.id !== "1M")
                            : ""
                        }
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke={LINE_COLORS[0]}
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false}
                        name={focusCoin?.name}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>
                </>
              )}
            </div>
          )}

          {viewMode === "single" && singleStyle === "candles" && (
            <div className={styles.chartCard}>
              {candleStatus === "loading" && (
                <p className={styles.statusMessage}>טוען נתוני נרות...</p>
              )}
              {candleStatus === "unsupported" && focusCoin && (
                <p className={styles.statusMessage}>
                  לא הצלחנו למצוא נתוני נרות עבור {focusCoin.name} (לא ב-Kraken ולא
                  ב-CoinGecko). נסו מטבע אחר, או עברו לתצוגת קו.
                </p>
              )}
              {candleStatus === "error" && (
                <p className={styles.statusMessage}>שגיאה בטעינת נתוני הנרות. נסו שוב בעוד רגע.</p>
              )}
              {candleStatus === "loaded" && candles.length > 0 && (
                <>
                  {candleSource === "coingecko-fallback" && (
                    <p className={styles.fallbackNote}>
                      {focusCoin?.name} לא נסחר ב-Kraken - הנתונים כאן מגיעים מ-CoinGecko
                      (רזולוציה קצת שונה מהרגילה).
                    </p>
                  )}
                  <CandlestickChart
                    candles={candles}
                    timeLabelFormatter={candleTimeFormatter}
                    fullDateFormatter={(timeMs) => formatFullDate(timeMs, selectedInterval.id !== "1M")}
                  />
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
