import type { ImageMetadata } from "astro";
import BlueskyDarkIcon from "@assets/sns/bluesky_dark.svg";
import BlueskyLightIcon from "@assets/sns/bluesky_light.svg";
import GitHubDarkIcon from "@assets/sns/github_dark.svg";
import GitHubLightIcon from "@assets/sns/github_light.svg";
import QiitaDarkIcon from "@assets/sns/qiita_dark.png";
import QiitaLightIcon from "@assets/sns/qiita_light.png";
import XDarkIcon from "@assets/sns/x_dark.png";
import XLightIcon from "@assets/sns/x_light.png";
import ZennDarkIcon from "@assets/sns/zenn_dark.svg";
import ZennLightIcon from "@assets/sns/zenn_light.svg";
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
