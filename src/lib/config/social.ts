import { siBluesky, siGithub, siQiita, siX, siZenn, type SimpleIcon } from "simple-icons";
import { author } from "./site";

export interface SocialLink {
  name: string;
  url: string;
  icon: SimpleIcon;
}

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: `https://github.com/${author.name}`, icon: siGithub },
  { name: "X", url: `https://x.com/${author.name}`, icon: siX },
  { name: "Bluesky", url: `https://bsky.app/profile/${author.name}.bsky.social`, icon: siBluesky },
  { name: "Qiita", url: `https://qiita.com/${author.name}`, icon: siQiita },
  { name: "Zenn", url: `https://zenn.dev/${author.name}`, icon: siZenn },
];
