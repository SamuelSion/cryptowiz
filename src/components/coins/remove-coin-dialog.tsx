import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { cancelPendingSelection, replaceCoin } from "../../store/slices/selected-coins-slice";
import styles from "./remove-coin-dialog.module.css";

// Closing this dialog any way other than confirming never adds the 6th coin.
export default function RemoveCoinDialog() {
  const dispatch = useAppDispatch();
  const pendingCoinId = useAppSelector((state) => state.selectedCoins.pendingCoinId);
  const selectedIds = useAppSelector((state) => state.selectedCoins.ids);
  const allCoins = useAppSelector((state) => state.coins.items);
  const pendingCoin = allCoins.find((coin) => coin.id === pendingCoinId);
  const selectedCoins = allCoins.filter((coin) => selectedIds.includes(coin.id));

  const [coinIdToRemove, setCoinIdToRemove] = useState<string | null>(null);
  const isOpen = pendingCoinId !== null;

  useEffect(() => {
    if (!isOpen) {
      setCoinIdToRemove(null);
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        dispatch(cancelPendingSelection());
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, dispatch]);

  if (!isOpen) {
    return null;
  }

  function handleConfirm() {
    if (!coinIdToRemove) {
      return;
    }
    dispatch(replaceCoin({ coinIdToRemove }));
  }

  function handleCancel() {
    dispatch(cancelPendingSelection());
  }

  return (
    <div className={styles.backdrop} onClick={handleCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-coin-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.dialogHeader}>
          <h2 id="remove-coin-dialog-title" className={styles.title}>
            כבר עוקבים אחרי 5 מטבעות
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={handleCancel}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <p className={styles.description}>
          כדי לעקוב אחרי <strong>{pendingCoin?.name ?? "המטבע החדש"}</strong>, בחרו מטבע אחד
          להסרה מהרשימה:
        </p>

        <ul className={styles.coinList}>
          {selectedCoins.map((coin) => (
            <li key={coin.id}>
              <label className={styles.coinOption}>
                <input
                  type="radio"
                  name="coin-to-remove"
                  value={coin.id}
                  checked={coinIdToRemove === coin.id}
                  onChange={() => setCoinIdToRemove(coin.id)}
                />
                <img src={coin.image} alt="" className={styles.coinIcon} />
                <span>{coin.name}</span>
                <span className={styles.coinSymbol}>{coin.symbol.toUpperCase()}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <button type="button" className={styles.secondaryButton} onClick={handleCancel}>
            ביטול
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleConfirm}
            disabled={!coinIdToRemove}
          >
            החלף מטבע
          </button>
        </div>
      </div>
    </div>
  );
}
