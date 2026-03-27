/** @jsxRuntime automatic */
/** @jsxImportSource solid-js */

import { For, createSignal, onCleanup, onMount } from "solid-js";
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

interface ThemeController {
  get: () => ThemeValue;
  set: (theme: ThemeValue) => void;
}

type ThemeWindow = Window & {
  __theme?: ThemeController;
};

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

export default function ThemeToggle() {
  const [activeTheme, setActiveTheme] = createSignal<ThemeValue>("system");
  const [ready, setReady] = createSignal(false);
  const [animate, setAnimate] = createSignal(false);

  const syncActiveTheme = (): void => {
    const themeApi = (window as ThemeWindow).__theme;
    setActiveTheme(themeApi?.get() ?? "system");
    setReady(true);
  };

  const handleSelect = (theme: ThemeValue): void => {
    const themeApi = (window as ThemeWindow).__theme;
    themeApi?.set(theme);
    setActiveTheme(theme);
    setAnimate(true);
  };

  onMount(() => {
    syncActiveTheme();
    document.addEventListener("astro:before-preparation", syncActiveTheme);

    onCleanup(() => {
      document.removeEventListener("astro:before-preparation", syncActiveTheme);
    });
  });

  return (
    <div
      class={themeToggleRoot}
      role="group"
      aria-label="Color Theme"
      data-theme-active={ready() ? activeTheme() : undefined}
      data-theme-toggle-ready={ready() ? "true" : "false"}
      data-theme-toggle-animate={animate() ? "true" : "false"}
    >
      <span class={themeToggleActiveIndicator} aria-hidden="true" />
      <For each={options}>
        {(option) => (
          <button
            type="button"
            class={themeToggleButton}
            aria-pressed={activeTheme() === option.value ? "true" : "false"}
            aria-label={`Set ${option.label} theme`}
            title={option.label}
            data-theme-toggle-option={option.value}
            onClick={() => {
              handleSelect(option.value);
            }}
          >
            <span class={themeToggleIcon} aria-hidden="true" innerHTML={option.icon} />
          </button>
        )}
      </For>
    </div>
  );
}
