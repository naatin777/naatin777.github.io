import { author } from "./author";

export interface SiteMetadata {
  url: string;
  title: string;
  description: string;
}

export const site: SiteMetadata = {
  url: "https://naatin777.dev",
  title: `${author.displayName}'s Portfolio`,
  description: `${author.displayName}'s personal portfolio. A place for my coding experiments and learning journey, building things step by step.`,
};
