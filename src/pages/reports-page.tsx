import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";
import { coinsService } from "../services/coins-service";
import { useLivePrices } from "../hooks/use-live-prices";
import { useCandles } from "../hooks/use-candles";
import { INTERVAL_OPTIONS } from "../constants/report-intervals";
import ReportsControls from "../components/reports/reports-controls";
import type { ViewMode, SingleStyle } from "../components/reports/reports-controls";
import AllCoinsLiveChart from "../components/reports/all-coins-live-chart";
import SingleCoinLineChart from "../components/reports/single-coin-line-chart";
import SingleCoinCandleChart from "../components/reports/single-coin-candle-chart";
import styles from "./reports-page.module.css";

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

  const isMonthInterval = selectedInterval.id === "1M";

  return (
    <div className="page-container">
      <h1 className="page-heading">דו״ח זמן אמת</h1>

      {trackedCoins.length === 0 ? (
        <div className={styles.emptyState}>
          <p>עדיין לא סימנתם מטבעות למעקב.</p>
          <p className={styles.emptyHint}>
            עברו לדף הבית והפעילו את המתג על עד 5 מטבעות כדי לראות כאן דו״ח חי.
          </p>
        </div>
      ) : (
        <>
          <ReportsControls
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            singleStyle={singleStyle}
            onStyleChange={handleStyleChange}
            intervalId={intervalId}
            onIntervalChange={setIntervalId}
            trackedCoins={trackedCoins}
            focusCoinId={focusCoinId}
            onFocusCoinChange={setFocusCoinId}
          />

          {viewMode === "all-live" && (
            <AllCoinsLiveChart
              trackedCoins={trackedCoins}
              allSymbols={allSymbols}
              chartData={allLiveChartData}
              status={allStatus}
              source={allSource}
            />
          )}

          {viewMode === "single" && singleStyle === "line" && (
            <div className={styles.chartCard}>
              <SingleCoinLineChart
                focusCoin={focusCoin}
                isLive={intervalId === "live"}
                liveStatus={singleLiveStatus}
                liveChartData={singleLiveChartData}
                candleStatus={candleStatus}
                candleSource={candleSource}
                historicalChartData={historicalLineData}
                isMonthInterval={isMonthInterval}
              />
            </div>
          )}

          {viewMode === "single" && singleStyle === "candles" && (
            <div className={styles.chartCard}>
              <SingleCoinCandleChart
                focusCoin={focusCoin}
                status={candleStatus}
                source={candleSource}
                candles={candles}
                timeLabelFormatter={candleTimeFormatter}
                isMonthInterval={isMonthInterval}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
