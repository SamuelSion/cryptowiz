import styles from "./page-loading-spinner.module.css";

// The fallback shown by <Suspense> while a lazy-loaded page's code is
// still being downloaded.
export default function PageLoadingSpinner() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.spinner} aria-hidden="true" />
      <span>טוען...</span>
    </div>
  );
}
