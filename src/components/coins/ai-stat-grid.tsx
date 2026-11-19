import type { CoinDetails } from "../../models/coin";
import styles from "./ai-stat-grid.module.css";

interface AiStatGridProps {
  details: CoinDetails;
}

export default function AiStatGrid({ details }: AiStatGridProps) {
  const supplyPercent = details.market_data.max_supply
    ? (
        (details.market_data.circulating_supply / details.market_data.max_supply) *
        100
      ).toFixed(1)
    : null;
  const liquidityPercent = (
    (details.market_data.total_volume.usd / details.market_data.market_cap.usd) *
    100
  ).toFixed(2);

  return (
    <dl className={styles.statGrid}>
      <dt>דירוג שווי שוק</dt>
      <dt>מרחק מהשיא ההיסטורי</dt>
      <dd className="mono-num">
        {details.market_cap_rank ? `#${details.market_cap_rank}` : "—"}
      </dd>
      <dd className="mono-num">{details.market_data.ath_change_percentage.usd.toFixed(1)}%</dd>

      <dt>אחוז מההיצע שכבר במחזור</dt>
      <dt>נזילות (מחזור יומי / שווי שוק)</dt>
      <dd className="mono-num">{supplyPercent ? `${supplyPercent}%` : "ללא תקרת היצע"}</dd>
      <dd className="mono-num">{liquidityPercent}%</dd>
    </dl>
  );
}
