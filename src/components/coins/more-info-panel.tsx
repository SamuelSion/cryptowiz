import { useState } from "react";
import { fetchCoinDetails } from "../../api/coingecko-api";
import styles from "./more-info-panel.module.css";

interface MoreInfoPanelProps {
  coinId: string;
}

interface CurrencyPrices {
  usd: number;
  eur: number;
  ils: number;
}

const CURRENCY_SYMBOLS: Array<{ key: keyof CurrencyPrices; symbol: string; code: string }> = [
  { key: "usd", symbol: "$", code: "USD" },
  { key: "eur", symbol: "€", code: "EUR" },
  { key: "ils", symbol: "₪", code: "ILS" },
];

// Renders collapsed by default. Data is fetched only the first time the
// panel is opened, then kept in local state for the lifetime of the card.
export default function MoreInfoPanel({ coinId }: MoreInfoPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [prices, setPrices] = useState<CurrencyPrices | null>(null);

  async function handleToggle() {
    const nextIsOpen = !isOpen;
    setIsOpen(nextIsOpen);

    if (nextIsOpen && status === "idle") {
      setStatus("loading");
      try {
        const details = await fetchCoinDetails(coinId);
        setPrices({
          usd: details.market_data.current_price.usd,
          eur: details.market_data.current_price.eur,
          ils: details.market_data.current_price.ils,
        });
        setStatus("loaded");
      } catch {
        setStatus("error");
      }
    }
  }

  return (
    <div className={styles.wrapper}>
      <button type="button" className={styles.trigger} onClick={handleToggle}>
        <span>More Info</span>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}>⌄</span>
      </button>

      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        {status === "loading" && <p className={styles.status}>טוען שערים...</p>}
        {status === "error" && <p className={styles.statusError}>שגיאה בטעינת השערים</p>}
        {status === "loaded" && prices && (
          <ul className={styles.priceList}>
            {CURRENCY_SYMBOLS.map(({ key, symbol, code }) => (
              <li key={code} className={styles.priceRow}>
                <span className={styles.currencyCode}>{code}</span>
                <span className={`${styles.priceValue} mono-num`}>
                  {symbol}
                  {prices[key].toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
