export interface Author {
  name: string;
  displayName: string;
}

export const author: Author = {
  name: "naatin777",
  displayName: "Naatin",
};

export interface SiteMetadata {
  url: string;
  title: string;
  description: string;
}

export const site: SiteMetadata = {
  url: "https://naatin777.dev",
  title: `${author.displayName}'s Portfolio`,
  description: `${author.displayName}'s personal portfolio — coding experiments and things I build, collected one step at a time.`,
};
