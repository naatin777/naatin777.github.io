import { style } from "@vanilla-extract/css";
import { themeVars, darkTheme } from "./theme.css";

export const githubLink = style({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 44,
  height: 44,
  borderRadius: "50%",
  background: themeVars.color.background,
});

const icon = style({ width: 32, height: 32 });

export const githubIconLight = style([
  icon,
  {
    display: "block",
    selectors: { [`.${darkTheme} &`]: { display: "none" } },
  },
]);

export const githubIconDark = style([
  icon,
  {
    display: "none",
    selectors: { [`.${darkTheme} &`]: { display: "block" } },
  },
]);
