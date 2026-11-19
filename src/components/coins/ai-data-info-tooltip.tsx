import { useState } from "react";
import type { CoinSummaryForAi } from "../../services/openai-service";
import styles from "./ai-data-info-tooltip.module.css";

interface AiDataInfoTooltipProps {
  summary: CoinSummaryForAi;
}

function formatValue(value: number | string | null): string {
  if (value === null) return "—";
  if (typeof value === "string") return value;
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Fields sent to ChatGPT, in order.
function buildRows(summary: CoinSummaryForAi): Array<{ label: string; value: string }> {
  return [
    { label: "שם", value: summary.name },
    { label: "דירוג שווי שוק", value: summary.market_cap_rank ? `#${summary.market_cap_rank}` : "—" },
    { label: "מחיר נוכחי (USD)", value: `$${formatValue(summary.current_price_usd)}` },
    { label: "שווי שוק (USD)", value: `$${formatValue(summary.market_cap_usd)}` },
    { label: "מחזור מסחר 24ש׳ (USD)", value: `$${formatValue(summary.volume_24h_usd)}` },
    {
      label: "יחס נזילות (מחזור/שווי שוק)",
      value: summary.volume_to_market_cap_ratio !== null
        ? `${(summary.volume_to_market_cap_ratio * 100).toFixed(2)}%`
        : "—",
    },
    { label: "היצע במחזור", value: formatValue(summary.circulating_supply) },
    { label: "תקרת היצע", value: summary.max_supply ? formatValue(summary.max_supply) : "ללא תקרה" },
    {
      label: "אחוז מההיצע שכבר במחזור",
      value: summary.supply_already_circulating_percent !== null
        ? `${summary.supply_already_circulating_percent.toFixed(1)}%`
        : "—",
    },
    {
      label: "מרחק מהשיא ההיסטורי",
      value: `${formatValue(summary.distance_from_all_time_high_percent)}%`,
    },
    { label: "שינוי מחיר ב-30 ימים", value: `${formatValue(summary.price_change_percentage_30d_in_currency)}%` },
    { label: "שינוי מחיר ב-60 ימים", value: `${formatValue(summary.price_change_percentage_60d_in_currency)}%` },
    {
      label: "שינוי מחיר ב-200 ימים",
      value: `${formatValue(summary.price_change_percentage_200d_in_currency)}%`,
    },
  ];
}

// Info button that reveals the data sent to ChatGPT for this recommendation.
export default function AiDataInfoTooltip({ summary }: AiDataInfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rows = buildRows(summary);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.infoButton}
        onClick={() => setIsOpen((value) => !value)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        aria-label="מה נשלח ל-ChatGPT לניתוח"
        title="מה נשלח ל-ChatGPT לניתוח"
      >
        i
      </button>

      {isOpen && (
        <div className={styles.popover} role="tooltip">
          <p className={styles.popoverTitle}>הנתונים שנשלחו ל-ChatGPT לניתוח</p>
          <dl className={styles.popoverList}>
            {rows.map((row) => (
              <div key={row.label} className={styles.popoverRow}>
                <dt>{row.label}</dt>
                <dd className="mono-num">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.popoverFootnote}>
            ההמלצה מבוססת אך ורק על הנתונים האלה - לא על חדשות, סנטימנט או מידע חיצוני אחר.
          </p>
        </div>
      )}
    </div>
  );
}
