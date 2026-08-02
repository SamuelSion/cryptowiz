import { useEffect, useMemo } from "react";
import { useAppSelector } from "../../store/hooks";
import { coinsService } from "../../services/coins-service";
import CoinCard from "./coin-card";
import styles from "./coin-grid.module.css";

export default function CoinGrid() {
  const { items, status, error, searchTerm } = useAppSelector((state) => state.coins);

  useEffect(() => {
    coinsService.loadTopCoins();
  }, []);

  // Client-side filter - no network call while typing.
  const filteredCoins = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return items;
    }
    return items.filter(
      (coin) =>
        coin.name.toLowerCase().includes(normalizedTerm) ||
        coin.symbol.toLowerCase().includes(normalizedTerm)
    );
  }, [items, searchTerm]);

  if (status === "loading" || status === "idle") {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard} aria-hidden="true" />
        ))}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorMessage}>שגיאה בטעינת רשימת המטבעות: {error}</p>
        <p className={styles.errorHint}>
          לרוב זה קורה בגלל הגבלת קצב (rate limit) של ה-API הציבורי של CoinGecko. אם זה חוזר
          על עצמו, הוסיפו מפתח Demo חינמי (ראו README) כדי לקבל מכסה גבוהה בהרבה.
        </p>
        <button type="button" className={styles.retryButton} onClick={() => coinsService.loadTopCoins()}>
          נסה שוב
        </button>
      </div>
    );
  }

  // Fetch succeeded but returned zero coins - usually a rate limit.
  if (items.length === 0) {
    return (
      <div className={styles.errorState}>
        <p className={styles.errorMessage}>רשימת המטבעות חזרה ריקה מהשרת.</p>
        <p className={styles.errorHint}>
          זה בדרך כלל אומר שה-API הציבורי של CoinGecko הגביל את הקצב (rate limit). רעננו את
          הדף בעוד דקה, ואם זה חוזר - הוסיפו מפתח Demo חינמי כמתואר ב-README.
        </p>
        <button type="button" className={styles.retryButton} onClick={() => coinsService.loadTopCoins()}>
          נסה שוב
        </button>
      </div>
    );
  }

  if (filteredCoins.length === 0) {
    return <p className={styles.emptyMessage}>לא נמצאו מטבעות התואמים לחיפוש.</p>;
  }

  return (
    <div className={styles.grid}>
      {filteredCoins.map((coin, index) => (
        <CoinCard key={coin.id} coin={coin} index={index} />
      ))}
    </div>
  );
}
