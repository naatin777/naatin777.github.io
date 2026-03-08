import { createThemeContract } from "@vanilla-extract/css";

export const themeVars = createThemeContract({
  color: {
    background: "",
    surface: "",
    surfaceSoft: "",
    surfaceFloating: "",
    surfaceHover: "",
    surfaceActive: "",
    overlay: "",

    borderSoft: "",
    border: "",
    borderStrong: "",

    text: "",
    textStrong: "",
    textMuted: "",
    textWeak: "",

    link: "",
    linkHover: "",

    focusRing: "",
    selectionBg: "",

    codeBg: "",
    codeBorder: "",

    status: {
      success: "",
      warning: "",
      danger: "",
      info: "",
    },

    scrollThumb: "",
    scrollThumbHover: "",

    accent: {
      blogBg: "",
      blogBorder: "",
      qiitaBg: "",
      qiitaBorder: "",
      zennBg: "",
      zennBorder: "",
    },
  },

  spacing: {
    none: "",
    xs: "",
    sm: "",
    md: "",
    lg: "",
    xl: "",
  },

  radius: {
    sm: "",
    md: "",
    lg: "",
    pill: "",
  },

  shadow: {
    sm: "",
    md: "",
    lg: "",
  },

  borderWidth: {
    hairline: "",
    thin: "",
    thick: "",
  },

  fontFamily: "",
  fontWeight: {
    medium: "",
    semibold: "",
    bold: "",
  },
  fontSize: {
    xs: "",
    sm: "",
    md: "",
    lg: "",
    xl: "",
  },
  lineHeight: {
    tight: "",
    normal: "",
    relaxed: "",
  },

  layout: {
    page: "",
    container: "",
    content: "",
    reading: "",
  },

  zIndex: {
    header: "",
    dropdown: "",
    overlay: "",
    modal: "",
    toast: "",
  },

  effect: {
    blur: "",
  },

  motion: {
    duration: {
      fast: "",
      normal: "",
      slow: "",
    },
    easing: {
      standard: "",
      emphasized: "",
    },
  },
});
