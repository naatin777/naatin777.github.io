import { resolve } from "$app/paths";
import type { LocalizedText } from "./i18n";

export interface NavItem {
  href: string;
  activeOn: string[];
  texts: LocalizedText;
}

// Header navigation and sitemap.xml both derive from this list.
export const navItems: NavItem[] = [
  {
    href: resolve("articles/"),
    activeOn: ["/articles/", "/posts/", "/series/"],
    texts: { ja: "記事", en: "Articles" },
  },
  { href: resolve("projects/"), activeOn: ["/projects/"], texts: { ja: "制作物", en: "Projects" } },
  { href: resolve("activity/"), activeOn: ["/activity/"], texts: { ja: "活動", en: "Activity" } },
  { href: resolve("about/"), activeOn: ["/about/"], texts: { ja: "運営者", en: "About" } },
];
