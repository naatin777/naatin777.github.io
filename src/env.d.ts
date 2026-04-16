type SiteTheme = "light" | "dark" | "system";

interface ThemeController {
  get: () => SiteTheme;
  set: (theme: SiteTheme) => void;
}

interface Window {
  __theme?: ThemeController;
  __siteThemeMediaBound__?: boolean;
  __siteThemeBeforeSwapBound__?: boolean;
  __siteThemePageLoadBound__?: boolean;
}
