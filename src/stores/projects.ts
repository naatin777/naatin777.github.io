import { atom } from "nanostores";

const projectTagsParamKey = "projectTags";

export const getTagsFromUrl = (): string[] => {
  if (typeof window === "undefined") return [];
  const params = new URLSearchParams(window.location.search);
  const tagParams = params.get(projectTagsParamKey);
  return tagParams ? tagParams.split(",").filter(Boolean) : [];
};

export const $projectTags = atom<string[]>(getTagsFromUrl());

export const selectAllProjectTags = (tags: string[]) => {
  $projectTags.set([...new Set(tags)]);
};

export const clearProjectTags = () => {
  $projectTags.set([]);
};

export const toggleProjectTag = (tag: string) => {
  const currentTags = $projectTags.get();
  const index = currentTags.indexOf(tag);
  if (index === -1) {
    $projectTags.set([...currentTags, tag]);
  } else {
    $projectTags.set(currentTags.filter((currentTag) => currentTag !== tag));
  }
};

if (typeof window !== "undefined") {
  $projectTags.set(getTagsFromUrl());

  window.addEventListener("popstate", () => {
    $projectTags.set(getTagsFromUrl());
  });

  document.addEventListener("astro:page-load", () => {
    $projectTags.set(getTagsFromUrl());
  });

  $projectTags.listen((currentTags) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (currentTags.length > 0) {
      url.searchParams.set(projectTagsParamKey, currentTags.join(","));
    } else {
      url.searchParams.delete(projectTagsParamKey);
    }
    window.history.replaceState({}, "", url);
  });
}
