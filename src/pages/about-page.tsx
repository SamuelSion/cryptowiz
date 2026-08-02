import styles from "./about-page.module.css";

export default function AboutPage() {
  return (
    <div className="page-container">
      <h2 className="page-heading">אודות</h2>
      <p className="page-subheading">קצת על הפרויקט ועל מי שבנה אותו.</p>

      <div className={styles.layout}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>על הפרויקט</h3>
          <p className={styles.text}>
            CryptoWiz הוא מסוף מעקב אחר שוק המטבעות הדיגיטליים, שנבנה כפרויקט שני בקורס
            Full Stack Developer. האתר מציג את 100 המטבעות המובילים בזמן אמת, מאפשר בחירה של
            עד חמישה מטבעות למעקב צמוד, מציג עבורם דו״ח מחירים חי (בתצוגת קו או נרות יפניים)
            המתעדכן פעם בשנייה, ומספק המלצת קנייה מבוססת ניתוח AI לכל מטבע נבחר.
          </p>
          <p className={styles.text}>
            הפרויקט נכתב ב-React ו-TypeScript, עם Redux לניהול מצב גלובלי וצמצום פניות מיותרות
            לשרת, ומתחבר למספר שירותים חיצוניים: CoinGecko לרשימת המטבעות ולנתוני המטבע הבודד,
            Kraken כמקור הראשי לדו״ח המחירים החי והנרות היפניים (עם CryptoCompare ו-CoinPaprika
            כגיבוי), ו-OpenAI למנוע ההמלצות.
          </p>
        </section>

        <section className={styles.card}>
          <h3 className={styles.cardTitle}>עליי</h3>
          <div className={styles.profile}>
            <img src="/images/about-photo.jpg" alt="שמואל סיון" className={styles.photo} />
            <div>
              <p className={styles.name}>שמואל סיון</p>
              <p className={styles.role}>Full Stack Developer בהכשרה</p>
            </div>
          </div>
          <p className={styles.text}>
            הגעתי לעולם הפיתוח מקריירה בכירה בתחומי המודיעין והאכיפה הפיננסית, שם עבדתי עם
            מערכות מידע מורכבות, ניתוח נתונים וקבלת החלטות תחת אי-ודאות. היום אני מיישם את
            אותה חשיבה אנליטית בבניית מוצרי תוכנה — הפרויקט הזה, שמשלב נתוני שוק חיים עם
            ניתוח מבוסס AI, הוא דוגמה טובה לשילוב הזה.
          </p>
          <div className={styles.contactRow}>
            <a href="mailto:sionshmuel@gmail.com" className={styles.contactLink}>
              sionshmuel@gmail.com
            </a>
            <span className={styles.contactDivider}>•</span>
            <a href="tel:0506248296" className={styles.contactLink} dir="ltr">
              050-6248296
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
