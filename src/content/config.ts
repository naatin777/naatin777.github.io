import { feedLoader } from "@ascorbic/feed-loader";
import { defineCollection } from "astro:content";
import { author } from "@config/author";

const qiita = defineCollection({
  loader: feedLoader({
    url: `http://qiita.com/${author.name}/feed`,
  }),
});

const zenn = defineCollection({
  loader: feedLoader({
    url: `http://zenn.dev/${author.name}/feed`,
  }),
});

export const collections = {
  qiita,
  zenn,
};
