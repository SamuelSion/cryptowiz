import styles from "./ai-pros-cons.module.css";

interface AiProsConsProps {
  strengths: string[];
  risks: string[];
}

export default function AiProsCons({ strengths, risks }: AiProsConsProps) {
  if (strengths.length === 0 && risks.length === 0) {
    return null;
  }

  return (
    <div className={styles.prosConsGrid}>
      {strengths.length > 0 && (
        <div className={styles.prosConsColumn}>
          <h3 className={styles.prosConsHeading}>
            <span className={styles.prosIcon}>▲</span> נקודות לטובה
          </h3>
          <ul className={styles.prosConsList}>
            {strengths.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      {risks.length > 0 && (
        <div className={styles.prosConsColumn}>
          <h3 className={styles.prosConsHeading}>
            <span className={styles.consIcon}>▼</span> סיכונים
          </h3>
          <ul className={styles.prosConsList}>
            {risks.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
