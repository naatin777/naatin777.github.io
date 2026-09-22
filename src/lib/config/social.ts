import blueskyDarkIcon from "$lib/assets/social/bluesky-dark.svg";
import blueskyLightIcon from "$lib/assets/social/bluesky-light.svg";
import githubDarkIcon from "$lib/assets/social/github-dark.svg";
import githubLightIcon from "$lib/assets/social/github-light.svg";
import qiitaDarkIcon from "$lib/assets/social/qiita-dark.png";
import qiitaLightIcon from "$lib/assets/social/qiita-light.png";
import xDarkIcon from "$lib/assets/social/x-dark.png";
import xLightIcon from "$lib/assets/social/x-light.png";
import zennDarkIcon from "$lib/assets/social/zenn-dark.svg";
import zennLightIcon from "$lib/assets/social/zenn-light.svg";
import { author } from "./author";

export interface SocialLink {
  name: string;
  url: string;
  iconLight: string;
  iconDark: string;
  label: string;
}

export const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: `https://github.com/${author.name}`,
    iconLight: githubLightIcon,
    iconDark: githubDarkIcon,
    label: "Visit my GitHub profile",
  },
  {
    name: "X",
    url: `https://x.com/${author.name}`,
    iconLight: xLightIcon,
    iconDark: xDarkIcon,
    label: "Visit my X profile",
  },
  {
    name: "Bluesky",
    url: `https://bsky.app/profile/${author.name}.bsky.social`,
    iconLight: blueskyLightIcon,
    iconDark: blueskyDarkIcon,
    label: "Visit my Bluesky profile",
  },
  {
    name: "Qiita",
    url: `https://qiita.com/${author.name}`,
    iconLight: qiitaLightIcon,
    iconDark: qiitaDarkIcon,
    label: "Visit my Qiita profile",
  },
  {
    name: "Zenn",
    url: `https://zenn.dev/${author.name}`,
    iconLight: zennLightIcon,
    iconDark: zennDarkIcon,
    label: "Visit my Zenn profile",
  },
];
