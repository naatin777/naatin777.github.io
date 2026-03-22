import { atom } from "nanostores";

const articleTagsParamKey = "articleTags";

export const getTagsFromUrl = (): string[] => {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const tagParams = params.get(articleTagsParamKey);
  return tagParams ? tagParams.split(",").filter(Boolean) : [];
};

export const $articleTags = atom<string[]>(getTagsFromUrl());

export const toggleArticleTag = (tag: string) => {
  const currentTags = $articleTags.get();
  const index = currentTags.indexOf(tag);
  if (index === -1) {
    $articleTags.set([...currentTags, tag]);
  } else {
    $articleTags.set(currentTags.filter((currentTag) => currentTag !== tag));
  }
};

if (typeof window !== "undefined") {
  $articleTags.set(getTagsFromUrl());

  window.addEventListener("popstate", () => {
    $articleTags.set(getTagsFromUrl());
  });

  $articleTags.listen((currentTags) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (currentTags.length > 0) {
      url.searchParams.set(articleTagsParamKey, currentTags.join(","));
    } else {
      url.searchParams.delete(articleTagsParamKey);
    }
    window.history.replaceState({}, "", url);
  });
}
