import { useEffect, useMemo } from "react";
import { NuqsAdapter } from "nuqs/adapters/react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { tagCardActionButton } from "@components/card/TagCardActions.css";
import { tagCardHeader, tagCardList, tagCardTitle } from "@components/card/TagCard.css";
import { chip } from "@components/chip/Chip.css";
import { sprinkles } from "@styles/sprinkles.css";

type TagFilterKind = "article" | "project";
type QueryKey = "articleTags" | "projectTags";

interface TagFilterProps {
  kind: TagFilterKind;
  tags: string[];
  queryKey: QueryKey;
  listSelector: string;
}

const tagParser = parseAsArrayOf(parseAsString).withDefault([]);

function TagFilterContent({ kind, tags, queryKey, listSelector }: TagFilterProps) {
  const [selectedTags, setSelectedTags] = useQueryState(queryKey, tagParser);
  const uniqueTags = useMemo(() => [...new Set(tags)], [tags]);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>(listSelector);

    for (const item of items) {
      if (selectedTags.length === 0) {
        item.hidden = false;
        continue;
      }

      const itemTags = (item.dataset.tags ?? "").split(",").filter(Boolean);
      item.hidden = !selectedTags.some((tag) => itemTags.includes(tag));
    }
  }, [listSelector, selectedTags]);

  const updateSelectedTags = (nextTags: string[]): void => {
    const dedupedTags = [...new Set(nextTags)];
    void setSelectedTags(dedupedTags.length > 0 ? dedupedTags : null);
  };

  const toggleTag = (tag: string): void => {
    updateSelectedTags(
      selectedTags.includes(tag) ? selectedTags.filter((currentTag) => currentTag !== tag) : [...selectedTags, tag],
    );
  };

  const handleSelectAll = (): void => {
    updateSelectedTags(uniqueTags);
  };

  const handleClear = (): void => {
    void setSelectedTags(null);
  };

  const allSelected = uniqueTags.length > 0 && uniqueTags.every((tag) => selectedTags.includes(tag));
  const hasSelection = selectedTags.length > 0;

  return (
    <>
      <div className={tagCardHeader}>
        <h2 className={tagCardTitle}>Tags</h2>
        <div
          className={sprinkles({
            display: "flex",
            alignItems: "center",
            gap: "sm",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          })}
        >
          <button type="button" className={tagCardActionButton} onClick={handleSelectAll} disabled={allSelected}>
            Select all
          </button>
          <button type="button" className={tagCardActionButton} onClick={handleClear} disabled={!hasSelection}>
            Clear
          </button>
        </div>
      </div>
      <ul className={tagCardList}>
        {uniqueTags.map((tag) => {
          const isActive = selectedTags.includes(tag);

          return (
            <li key={`${kind}-${tag}`}>
              <button
                type="button"
                className={chip({ active: isActive })}
                aria-pressed={isActive}
                onClick={() => {
                  toggleTag(tag);
                }}
              >
                {tag}
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function TagFilter(props: TagFilterProps) {
  return (
    <NuqsAdapter>
      <TagFilterContent {...props} />
    </NuqsAdapter>
  );
}
