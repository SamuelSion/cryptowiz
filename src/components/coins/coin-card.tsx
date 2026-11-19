import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleCoinOff, toggleCoinOn } from "../../store/slices/selected-coins-slice";
import ToggleSwitch from "../common/toggle-switch";
import MoreInfoPanel from "./more-info-panel";
import type { CoinMarket } from "../../models/coin";
import styles from "./coin-card.module.css";

interface CoinCardProps {
  coin: CoinMarket;
  index: number;
}

export default function CoinCard({ coin, index }: CoinCardProps) {
  const dispatch = useAppDispatch();
  const isSelected = useAppSelector((state) => state.selectedCoins.ids.includes(coin.id));

  function handleSwitchChange() {
    if (isSelected) {
      dispatch(toggleCoinOff(coin.id));
    } else {
      dispatch(toggleCoinOn(coin.id));
    }
  }

  const indexClass = styles[`cardIndex${index % 100}`] ?? "";

  return (
    <article className={`${styles.card} ${indexClass} ${isSelected ? styles.cardTracked : ""}`}>
      <div className={styles.header}>
        <img src={coin.image} alt={coin.name} className={styles.icon} loading="lazy" />
        <div className={styles.titles}>
          <h3 className={styles.name}>{coin.name}</h3>
          <span className={styles.symbol}>{coin.symbol.toUpperCase()}</span>
        </div>
        <span className={`${styles.price} mono-num`}>
          ${coin.current_price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>

      <MoreInfoPanel coinId={coin.id} />

      <div className={styles.footer}>
        <span className={styles.footerLabel}>עקוב אחרי המטבע</span>
        <ToggleSwitch
          checked={isSelected}
          onChange={handleSwitchChange}
          label={`עקוב אחרי ${coin.name}`}
        />
      </div>
    </article>
  );
}
