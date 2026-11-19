import { INTERVAL_OPTIONS } from "../../constants/report-intervals";
import type { CoinMarket } from "../../models/coin";
import styles from "../../pages/reports-page.module.css";

export type ViewMode = "all-live" | "single";
export type SingleStyle = "line" | "candles";

interface ReportsControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  singleStyle: SingleStyle;
  onStyleChange: (style: SingleStyle) => void;
  intervalId: string;
  onIntervalChange: (id: string) => void;
  trackedCoins: CoinMarket[];
  focusCoinId: string | null;
  onFocusCoinChange: (id: string) => void;
}

export default function ReportsControls({
  viewMode,
  onViewModeChange,
  singleStyle,
  onStyleChange,
  intervalId,
  onIntervalChange,
  trackedCoins,
  focusCoinId,
  onFocusCoinChange,
}: ReportsControlsProps) {
  return (
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
            onClick={() => onViewModeChange("all-live")}
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
            onClick={() => onViewModeChange("single")}
          >
            מטבע בודד
          </button>
        </div>

        {viewMode === "single" && trackedCoins.length > 1 && (
          <select
            className={styles.coinSelect}
            value={focusCoinId ?? ""}
            onChange={(event) => onFocusCoinChange(event.target.value)}
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
              onClick={() => onStyleChange("line")}
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
              onClick={() => onStyleChange("candles")}
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
              onClick={() => onIntervalChange(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
