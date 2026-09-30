import type { LocalizedText } from "./i18n";

export interface NavItem {
  href: string;
  activeOn: string[];
  texts: LocalizedText;
}

// Header navigation and sitemap.xml both derive from this list.
export const navItems: NavItem[] = [
  { href: "/articles/", activeOn: ["/articles/", "/posts/", "/series/"], texts: { ja: "記事", en: "Articles" } },
  { href: "/projects/", activeOn: ["/projects/"], texts: { ja: "制作物", en: "Projects" } },
  { href: "/activity/", activeOn: ["/activity/"], texts: { ja: "活動", en: "Activity" } },
  { href: "/about/", activeOn: ["/about/"], texts: { ja: "運営者", en: "About" } },
];
