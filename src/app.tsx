import { useEffect } from "react";
import { useAppSelector } from "./store/hooks";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import RemoveCoinDialog from "./components/coins/remove-coin-dialog";
import AppRoutes from "./routes/app-routes";
import "./app.css";

export default function App() {
  const themeMode = useAppSelector((state) => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
  }, [themeMode]);

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <AppRoutes />
      </main>
      <Footer />
      <RemoveCoinDialog />
    </div>
  );
}
