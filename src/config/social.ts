import type { ImageMetadata } from "astro";
import BlueskyDarkIcon from "@assets/social/bluesky-dark.svg";
import BlueskyLightIcon from "@assets/social/bluesky-light.svg";
import GitHubDarkIcon from "@assets/social/github-dark.svg";
import GitHubLightIcon from "@assets/social/github-light.svg";
import QiitaDarkIcon from "@assets/social/qiita-dark.png";
import QiitaLightIcon from "@assets/social/qiita-light.png";
import XDarkIcon from "@assets/social/x-dark.png";
import XLightIcon from "@assets/social/x-light.png";
import ZennDarkIcon from "@assets/social/zenn-dark.svg";
import ZennLightIcon from "@assets/social/zenn-light.svg";
import { author } from "./author";

export interface SocialLink {
  name: string;
  url: string;
  iconLight: ImageMetadata;
  iconDark: ImageMetadata;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: `https://github.com/${author.name}`,
    iconLight: GitHubLightIcon,
    iconDark: GitHubDarkIcon,
    label: "Visit my GitHub profile",
  },
  {
    name: "X",
    url: `https://x.com/${author.name}`,
    iconLight: XLightIcon,
    iconDark: XDarkIcon,
    label: "Visit my X profile",
  },
  {
    name: "Bluesky",
    url: `https://bsky.app/profile/${author.name}.bsky.social`,
    iconLight: BlueskyLightIcon,
    iconDark: BlueskyDarkIcon,
    label: "Visit my Bluesky profile",
  },
  {
    name: "Qiita",
    url: `https://qiita.com/${author.name}`,
    iconLight: QiitaLightIcon,
    iconDark: QiitaDarkIcon,
    label: "Visit my Qiita profile",
  },
  {
    name: "Zenn",
    url: `https://zenn.dev/${author.name}`,
    iconLight: ZennLightIcon,
    iconDark: ZennDarkIcon,
    label: "Visit my Zenn profile",
  },
];
