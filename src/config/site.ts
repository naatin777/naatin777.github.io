import { author } from "./author";

export interface SiteMetadata {
  title: string;
  description: string;
}

export const siteMetadata: SiteMetadata = {
  title: `${author.displayName}'s Portfolio`,
  description: `${author.displayName}'s personal portfolio. A place for my coding experiments and learning journey, building things step by step.`,
};
