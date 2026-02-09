import { style } from "@vanilla-extract/css";

export const footer = style({
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1rem",
})

export const socialLinkGroup = style({
    display: "flex",
    gap: "2rem",
})