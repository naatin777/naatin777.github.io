// Shared structural types used across server and client boundaries.
// Types that only the server produces (Post etc.) stay in $lib/server — client
// components must not import from there, so shared shapes live here.

export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

export interface PostLink {
  slug: string;
  title: string;
  description?: string | undefined;
}

// Articles-list sort control — key constants are values because the page
// validates ?sort=/&order= against them.
export const sortKeys = ["title", "published", "updated"] as const;
export type SortKey = (typeof sortKeys)[number];
export const sortOrders = ["asc", "desc"] as const;
export type SortOrder = (typeof sortOrders)[number];
