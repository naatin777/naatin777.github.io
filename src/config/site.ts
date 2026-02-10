import { author } from "./author";

export interface SiteMetadata {
  title: string;
  description: string;
}

export const siteMetadata: SiteMetadata = {
  title: `${author.displayName}'s portfolio page`,
  description:
    "I am a beginner developer. I'm learning how to build things step by step.",
};
