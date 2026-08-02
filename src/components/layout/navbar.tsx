import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { setSearchTerm } from "../../store/slices/coins-slice";
import ThemeToggle from "./theme-toggle";
import BrandMark from "../common/brand-mark";
import styles from "./navbar.module.css";

const NAV_LINKS = [
  { to: "/", label: "דף הבית" },
  { to: "/reports", label: "דו״חות זמן אמת" },
  { to: "/ai-recommendation", label: "המלצת AI" },
  { to: "/about", label: "אודות" },
];

export default function Navbar() {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector((state) => state.coins.searchTerm);

  function handleSearchKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    const value = (event.target as HTMLInputElement).value;
    dispatch(setSearchTerm(value));
  }

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.brand}>
          <BrandMark size={20} className={styles.brandGlyph} />
          <span>CRYPTOWIZ</span>
        </NavLink>

        <nav className={styles.links} aria-label="ניווט ראשי">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.linkActive}` : styles.link
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.tools}>
          <form
            className={styles.searchWrap}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <svg className={styles.searchIcon} viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="9" cy="9" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <line x1="13.6" y1="13.6" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              id="coin-search"
              name="coin-search"
              className={styles.searchInput}
              placeholder="חיפוש מטבע לפי שם או סמל..."
              defaultValue={searchTerm}
              onKeyUp={handleSearchKeyUp}
              aria-label="חיפוש מטבע"
              autoComplete="off"
            />
          </form>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
