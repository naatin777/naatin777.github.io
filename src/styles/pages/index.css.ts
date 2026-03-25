import { style } from "@vanilla-extract/css";
import { sprinkles } from "../sprinkles.css";

export const homeProfileImage = style([
  sprinkles({ borderRadius: "pill" }),
  {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    filter: "drop-shadow(0 10px 24px rgba(2, 6, 23, 0.28))",
  },
]);

export const homeIntroText = style([
  sprinkles({ maxWidth: "reading", color: "muted", lineHeight: "relaxed" }),
  {
    textWrap: "balance",
  },
]);
