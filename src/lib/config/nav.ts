import type { LocalizedText } from "./i18n";

export interface NavItem {
  href: string;
  match: string[];
  texts: LocalizedText;
}

// Header navigation and sitemap.xml both derive from this list.
export const navItems: NavItem[] = [
  { href: "/articles/", match: ["/articles/", "/posts/"], texts: { ja: "記事", en: "Articles" } },
  { href: "/projects/", match: ["/projects/"], texts: { ja: "制作物", en: "Projects" } },
  { href: "/activity/", match: ["/activity/"], texts: { ja: "活動", en: "Activity" } },
  { href: "/about/", match: ["/about/"], texts: { ja: "運営者", en: "About" } },
];
