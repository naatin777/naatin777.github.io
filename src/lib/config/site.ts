interface Author {
  name: string;
  displayName: string;
}

export const author: Author = {
  name: "naatin777",
  displayName: "Naatin",
};

interface SiteMetadata {
  url: string;
  title: string;
  description: string;
}

export const site: SiteMetadata = {
  url: "https://naatin777.dev",
  title: `${author.displayName}'s Portfolio`,
  description: `${author.displayName}の個人ポートフォリオ。コードの実験や作ったものを少しずつ集めています。`,
};
