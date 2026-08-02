import { useEffect, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import HomePage from "./pages/home-page";
import AiRecommendationPage from "./pages/ai-recommendation-page";
import AboutPage from "./pages/about-page";
import RemoveCoinDialog from "./components/coins/remove-coin-dialog";
import PageLoadingSpinner from "./components/layout/page-loading-spinner";
import "./app.css";

// Lazy-loaded to keep recharts out of the main bundle.
const ReportsPage = lazy(() => import("./pages/reports-page"));

export default function App() {
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/reports"
            element={
              <Suspense fallback={<PageLoadingSpinner />}>
                <ReportsPage />
              </Suspense>
            }
          />
          <Route path="/ai-recommendation" element={<AiRecommendationPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
      <RemoveCoinDialog />
    </div>
  );
}
