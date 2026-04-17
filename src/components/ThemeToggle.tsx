import { useEffect, useState } from "react";
import MoonModeIcon from "@assets/mode/light.svg?raw";
import SunModeIcon from "@assets/mode/dark.svg?raw";
import SystemModeIcon from "@assets/mode/system.svg?raw";
import {
  themeToggleActiveIndicator,
  themeToggleButton,
  themeToggleIcon,
  themeToggleRoot,
} from "@components/ThemeToggle.css";

type ThemeValue = "light" | "dark" | "system";

interface ThemeOption {
  value: ThemeValue;
  label: string;
  icon: string;
}

const options: ThemeOption[] = [
  { value: "light", label: "Light", icon: SunModeIcon },
  { value: "system", label: "System", icon: SystemModeIcon },
  { value: "dark", label: "Dark", icon: MoonModeIcon },
];

const getInitialThemeState = (): { activeTheme: ThemeValue; ready: boolean } => {
  if (typeof window === "undefined") {
    return { activeTheme: "system", ready: false };
  }

  return {
    activeTheme: window.__theme?.get() ?? "system",
    ready: true,
  };
};

export default function ThemeToggle() {
  const [{ activeTheme, ready }, setThemeState] = useState(getInitialThemeState);
  const [animate, setAnimate] = useState(false);

  const syncActiveTheme = (): void => {
    const themeApi = window.__theme;
    setThemeState({
      activeTheme: themeApi?.get() ?? "system",
      ready: true,
    });
  };

  const handleSelect = (theme: ThemeValue): void => {
    const themeApi = window.__theme;
    themeApi?.set(theme);
    setThemeState({
      activeTheme: theme,
      ready: true,
    });
    setAnimate(true);
  };

  useEffect(() => {
    document.addEventListener("astro:before-preparation", syncActiveTheme);

    return () => {
      document.removeEventListener("astro:before-preparation", syncActiveTheme);
    };
  }, []);

  return (
    <div className={themeToggleRoot({ ready })} role="group" aria-label="Color Theme">
      <span className={themeToggleActiveIndicator({ activeTheme, ready, animate })} aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={themeToggleButton({ selected: activeTheme === option.value })}
          aria-pressed={activeTheme === option.value}
          aria-label={`Set ${option.label} theme`}
          title={option.label}
          onClick={() => {
            handleSelect(option.value);
          }}
        >
          <span
            className={themeToggleIcon({ active: activeTheme === option.value })}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: option.icon }}
          />
        </button>
      ))}
    </div>
  );
}
