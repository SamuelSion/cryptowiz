import BrandMark from "../common/brand-mark";
import styles from "./footer.module.css";

const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandColumn}>
          <span className={styles.brand}>
            <BrandMark size={14} className={styles.brandIcon} />
            CRYPTOWIZ
          </span>
          <span className={styles.copyright}>
            © {CURRENT_YEAR} CryptoWiz. כל הזכויות שמורות.
          </span>
        </div>

        <div className={styles.noteColumn}>
          <span className={styles.note}>נתוני שוק להמחשה בלבד ואינם מהווים ייעוץ השקעות.</span>
          <span className={styles.note}>
            נתוני מטבעות באדיבות{" "}
            <a href="https://www.coingecko.com" target="_blank" rel="noreferrer">
              CoinGecko
            </a>
            . מחירים בזמן אמת באדיבות{" "}
            <a href="https://www.kraken.com" target="_blank" rel="noreferrer">
              Kraken
            </a>
            ,{" "}
            <a href="https://www.cryptocompare.com" target="_blank" rel="noreferrer">
              CryptoCompare
            </a>{" "}
            ו-
            <a href="https://coinpaprika.com" target="_blank" rel="noreferrer">
              CoinPaprika
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
