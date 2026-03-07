import { globalStyle } from "@vanilla-extract/css";
import { darkTheme, lightTheme } from "./theme.css";
import { themeVars } from "./vars.css";
import { resetLayer, themeLayer, baseLayer, utilitiesLayer } from "./layers.css";

globalStyle("*, *::before, *::after", {
  "@layer": {
    [resetLayer]: {
      boxSizing: "border-box",
    },
  },
});

globalStyle("*", {
  "@layer": {
    [resetLayer]: {
      margin: 0,
      padding: 0,
    },
  },
});

globalStyle("html", {
  "@layer": {
    [resetLayer]: {
      display: "block",
      maxWidth: "100%",
    },
  },
});

globalStyle(`:root.${lightTheme}`, {
  "@layer": {
    [themeLayer]: {
      colorScheme: "light",
    },
  },
});

globalStyle(`:root.${darkTheme}`, {
  "@layer": {
    [themeLayer]: {
      colorScheme: "dark",
    },
  },
});

globalStyle("html", {
  "@layer": {
    [baseLayer]: {
      height: "100%",
      overflowY: "hidden",
      scrollbarGutter: "stable",
      scrollbarColor: `${themeVars.color.scrollThumb} transparent`,
      backgroundColor: themeVars.color.background,
    },
  },
});

globalStyle("body", {
  "@layer": {
    [baseLayer]: {
      display: "flex",
      flexDirection: "column",
      position: "relative",
      height: "100%",
      minHeight: "100dvh",
      overflowY: "auto",
      overflowX: "hidden",
      fontFamily: themeVars.fontFamily,
      color: themeVars.color.text,
      backgroundColor: themeVars.color.background,
      lineHeight: themeVars.lineHeight.normal,
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
      WebkitTapHighlightColor: "transparent",
    },
  },
});

globalStyle("body > header, body > main, body > footer", {
  "@layer": {
    [baseLayer]: {
      position: "relative",
      zIndex: 1,
    },
  },
});

globalStyle("main", {
  "@layer": {
    [baseLayer]: {
      flex: 1,
      width: "100%",
      paddingInline: themeVars.spacing.lg,
      paddingBlockStart: themeVars.spacing.md,
      paddingBlockEnd: themeVars.spacing.xl,
    },
  },
});

globalStyle("::-webkit-scrollbar", {
  "@layer": {
    [baseLayer]: {
      width: "8px",
    },
  },
});

globalStyle("::-webkit-scrollbar-track", {
  "@layer": {
    [baseLayer]: {
      background: "transparent",
      borderRadius: "6px",
    },
  },
});

globalStyle("::-webkit-scrollbar-thumb", {
  "@layer": {
    [baseLayer]: {
      backgroundColor: themeVars.color.scrollThumb,
      borderRadius: "6px",
    },
  },
});

globalStyle("::-webkit-scrollbar-thumb:hover", {
  "@layer": {
    [baseLayer]: {
      backgroundColor: themeVars.color.scrollThumbHover,
    },
  },
});

globalStyle(
  ':root[data-theme-transition="true"], :root[data-theme-transition="true"] *, :root[data-theme-transition="true"] *::before, :root[data-theme-transition="true"] *::after',
  {
    "@layer": {
      [utilitiesLayer]: {
        transitionProperty:
          "color, background-color, border-color, box-shadow, fill, stroke, outline-color, text-decoration-color",
        transitionDuration: themeVars.motion.duration.slow,
        transitionTimingFunction: themeVars.motion.easing.standard,
      },
    },
  },
);

globalStyle("*, *::before, *::after", {
  "@layer": {
    [utilitiesLayer]: {
      "@media": {
        "(prefers-reduced-motion: reduce)": {
          animationDuration: "0.01ms",
          animationIterationCount: "1",
          transitionDuration: "0.01ms",
          scrollBehavior: "auto",
        },
      },
    },
  },
});
