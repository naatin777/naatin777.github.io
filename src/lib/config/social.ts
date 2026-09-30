import { siBluesky, siGithub, siQiita, siX, siZenn, type SimpleIcon } from "simple-icons";
import { author } from "./site";

interface SocialLink {
  name: string;
  url: string;
  icon: SimpleIcon;
}

export const socialLinks: SocialLink[] = [
  { name: "GitHub", url: `https://github.com/${author.handle}`, icon: siGithub },
  { name: "X", url: `https://x.com/${author.handle}`, icon: siX },
  { name: "Bluesky", url: `https://bsky.app/profile/${author.handle}.bsky.social`, icon: siBluesky },
  { name: "Qiita", url: `https://qiita.com/${author.handle}`, icon: siQiita },
  { name: "Zenn", url: `https://zenn.dev/${author.handle}`, icon: siZenn },
];
