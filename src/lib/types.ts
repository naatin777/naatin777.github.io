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
}
