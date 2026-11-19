import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/home-page";
import AiRecommendationPage from "../pages/ai-recommendation-page";
import AboutPage from "../pages/about-page";
import NotFoundPage from "../pages/not-found-page";
import PageLoadingSpinner from "../components/layout/page-loading-spinner";

// Lazy-loaded to keep recharts out of the main bundle.
const ReportsPage = lazy(() => import("../pages/reports-page"));

export default function AppRoutes() {
  return (
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
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
