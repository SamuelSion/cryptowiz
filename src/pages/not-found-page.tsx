import { Link } from "react-router-dom";
import BrandMark from "../components/common/brand-mark";
import styles from "./not-found-page.module.css";

export default function NotFoundPage() {
  return (
    <div className={styles.wrapper}>
      <BrandMark size={40} className={styles.icon} />
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>הדף שחיפשתם לא נמצא.</p>
      <Link to="/" className={styles.homeLink}>
        חזרה לדף הבית
      </Link>
    </div>
  );
}
