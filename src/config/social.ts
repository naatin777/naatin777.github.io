import type { ImageMetadata } from "astro";
import GitHubIcon from "@assets/sns/github.svg";
import XIcon from "@assets/sns/x.svg";
import QiitaIcon from "@assets/sns/qiita.svg";
import ZennIcon from "@assets/sns/zenn.svg";
import BlueskyIcon from "@assets/sns/bluesky.svg";
import { author } from "./author";

export interface SocialLink {
  name: string;
  url: string;
  icon: ImageMetadata;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: `https://github.com/${author.name}`,
    icon: GitHubIcon,
    label: "Visit my GitHub profile",
  },
  {
    name: "X",
    url: `https://x.com/${author.name}`,
    icon: XIcon,
    label: "Visit my X profile",
  },
  {
    name: "Bluesky",
    url: `https://bsky.app/profile/${author.name}.bsky.social`,
    icon: BlueskyIcon,
    label: "Visit my Bluesky profile",
  },
  {
    name: "Qiita",
    url: `https://qiita.com/${author.name}`,
    icon: QiitaIcon,
    label: "Visit my Qiita profile",
  },
  {
    name: "Zenn",
    url: `https://zenn.dev/${author.name}`,
    icon: ZennIcon,
    label: "Visit my Zenn profile",
  },
];
