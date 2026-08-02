import styles from "./toggle-switch.module.css";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  label: string;
}

// A styled checkbox (Switch) shared by any feature that needs an on/off
// control — currently used to mark a coin as "tracked" on the home page.
export default function ToggleSwitch({ checked, onChange, label }: ToggleSwitchProps) {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        aria-label={label}
        className={styles.input}
      />
      <span className={styles.track}>
        <span className={styles.knob} />
      </span>
    </label>
  );
}
