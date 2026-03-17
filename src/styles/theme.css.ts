import { createTheme } from "@vanilla-extract/css";
import { themeLayer } from "./layers.css";
import { themeVars } from "./vars.css";

const sharedThemeValues = {
  spacing: {
    none: "0rem",
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  },
  radius: {
    sm: "12px",
    md: "14px",
    lg: "16px",
    pill: "999px",
  },
  shadow: {
    sm: "0 2px 8px rgba(15, 23, 42, 0.08)",
    md: "0 8px 24px rgba(15, 23, 42, 0.12)",
    lg: "0 16px 36px rgba(15, 23, 42, 0.18)",
  },
  borderWidth: {
    hairline: "0.5px",
    thin: "1px",
    thick: "2px",
  },
  fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
  fontWeight: {
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.5rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  lineHeight: {
    tight: "1.3",
    normal: "1.5",
    relaxed: "1.75",
  },
  layout: {
    page: "60rem",
    container: "72rem",
    content: "56rem",
    reading: "42rem",
  },
  zIndex: {
    header: "100",
    dropdown: "40",
    overlay: "60",
    modal: "80",
    toast: "100",
  },
  effect: {
    blur: "10px",
  },
  motion: {
    duration: {
      fast: "120ms",
      normal: "150ms",
      slow: "260ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0, 1)",
      emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    },
  },
} as const;

export const lightThemeValues = {
  color: {
    background: "#f8fafc",
    surface: "rgba(255, 255, 255, 0.86)",
    surfaceSoft: "rgba(255, 255, 255, 0.92)",
    surfaceFloating: "rgba(255, 255, 255, 0.7)",
    surfaceHover: "rgba(15, 23, 42, 0.06)",
    surfaceActive: "rgba(15, 23, 42, 0.12)",
    overlay: "rgba(2, 6, 23, 0.42)",
    borderSoft: "rgba(15, 23, 42, 0.1)",
    border: "rgba(15, 23, 42, 0.14)",
    borderStrong: "rgba(15, 23, 42, 0.22)",
    text: "#0f172a",
    textStrong: "#020617",
    textMuted: "rgba(15, 23, 42, 0.74)",
    textWeak: "rgba(15, 23, 42, 0.58)",
    link: "#2563eb",
    linkHover: "#1d4ed8",
    focusRing: "rgba(37, 99, 235, 0.45)",
    selectionBg: "rgba(37, 99, 235, 0.22)",
    codeBg: "rgba(15, 23, 42, 0.06)",
    codeBorder: "rgba(15, 23, 42, 0.12)",
    status: {
      success: "#16a34a",
      warning: "#d97706",
      danger: "#dc2626",
      info: "#2563eb",
    },
    scrollThumb: "rgba(15, 23, 42, 0.28)",
    scrollThumbHover: "rgba(15, 23, 42, 0.4)",
    accent: {
      blogBg: "rgba(79, 70, 229, 0.14)",
      blogBorder: "rgba(79, 70, 229, 0.28)",
      qiitaBg: "rgba(22, 163, 74, 0.14)",
      qiitaBorder: "rgba(22, 163, 74, 0.28)",
      zennBg: "rgba(37, 99, 235, 0.14)",
      zennBorder: "rgba(37, 99, 235, 0.28)",
    },
  },
  ...sharedThemeValues,
} as const;

export const darkThemeValues = {
  color: {
    background: "#0e0e0eff",
    surface: "rgba(255, 255, 255, 0.04)",
    surfaceSoft: "rgba(255, 255, 255, 0.05)",
    surfaceFloating: "rgba(14, 14, 14, 0.7)",
    surfaceHover: "rgba(255, 255, 255, 0.07)",
    surfaceActive: "rgba(255, 255, 255, 0.18)",
    overlay: "rgba(2, 6, 23, 0.72)",
    borderSoft: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.1)",
    borderStrong: "rgba(255, 255, 255, 0.14)",
    text: "#f8fafc",
    textStrong: "rgba(255, 255, 255, 0.96)",
    textMuted: "rgba(255, 255, 255, 0.74)",
    textWeak: "rgba(255, 255, 255, 0.6)",
    link: "#60a5fa",
    linkHover: "#93c5fd",
    focusRing: "rgba(255, 255, 255, 0.45)",
    selectionBg: "rgba(96, 165, 250, 0.3)",
    codeBg: "rgba(255, 255, 255, 0.08)",
    codeBorder: "rgba(255, 255, 255, 0.16)",
    status: {
      success: "#22c55e",
      warning: "#f59e0b",
      danger: "#ef4444",
      info: "#60a5fa",
    },
    scrollThumb: "rgba(255, 255, 255, 0.2)",
    scrollThumbHover: "rgba(255, 255, 255, 0.3)",
    accent: {
      blogBg: "rgba(99, 102, 241, 0.18)",
      blogBorder: "rgba(99, 102, 241, 0.32)",
      qiitaBg: "rgba(85, 197, 0, 0.18)",
      qiitaBorder: "rgba(85, 197, 0, 0.32)",
      zennBg: "rgba(59, 130, 246, 0.18)",
      zennBorder: "rgba(59, 130, 246, 0.32)",
    },
  },
  ...sharedThemeValues,
} as const;

export const lightTheme = createTheme(themeVars, {
  "@layer": themeLayer,
  ...lightThemeValues,
});

export const darkTheme = createTheme(themeVars, {
  "@layer": themeLayer,
  ...darkThemeValues,
});
