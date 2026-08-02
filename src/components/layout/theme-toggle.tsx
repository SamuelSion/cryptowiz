import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toggleTheme } from "../../store/slices/theme-slice";
import styles from "./theme-toggle.module.css";

export default function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const isLight = mode === "light";

  function handleClick() {
    dispatch(toggleTheme());
  }

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={handleClick}
      role="switch"
      aria-checked={isLight}
      aria-label={isLight ? "עבור למצב כהה" : "עבור למצב בהיר"}
      title={isLight ? "מצב בהיר" : "מצב כהה"}
    >
      <span className={styles.track}>
        <span className={`${styles.knob} ${isLight ? styles.knobLight : ""}`}>
          {isLight ? "☀" : "🌙"}
        </span>
      </span>
    </button>
  );
}
