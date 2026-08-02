import ParallaxHero from "../components/layout/parallax-hero";
import CoinGrid from "../components/coins/coin-grid";

export default function HomePage() {
  return (
    <>
      <ParallaxHero />
      <div className="page-container">
        <h2 className="page-heading">100 המטבעות המובילים</h2>
        <p className="page-subheading">
          לחצו More Info לצפייה במחיר בדולר, יורו ושקל, והפעילו את המתג כדי לעקוב אחרי מטבע
          בדו״חות זמן אמת ובהמלצת ה-AI (עד 5 מטבעות).
        </p>
        <CoinGrid />
      </div>
    </>
  );
}
