/** @jsxRuntime automatic */
/** @jsxImportSource solid-js */

import { useStore } from "@nanostores/solid";
import { tagCardActionButton } from "@components/card/TagCardActions.css";
import { $articleTags, clearArticleTags, selectAllArticleTags } from "../../stores/articles";
import { $projectTags, clearProjectTags, selectAllProjectTags } from "../../stores/projects";
import { sprinkles } from "@styles/sprinkles.css";

interface TagCardActionsProps {
  kind: "article" | "project";
  tags: string[];
}

export default function TagCardActions(props: TagCardActionsProps) {
  const articleTags = useStore($articleTags);
  const projectTags = useStore($projectTags);

  const selectedTags = () => (props.kind === "article" ? articleTags() : projectTags());

  const handleSelectAll = () => {
    if (props.kind === "article") {
      selectAllArticleTags(props.tags);
      return;
    }

    selectAllProjectTags(props.tags);
  };

  const handleClear = () => {
    if (props.kind === "article") {
      clearArticleTags();
      return;
    }

    clearProjectTags();
  };

  const allSelected = () => props.tags.length > 0 && props.tags.every((tag) => selectedTags().includes(tag));

  const hasSelection = () => selectedTags().length > 0;

  return (
    <div
      class={sprinkles({
        display: "flex",
        alignItems: "center",
        gap: "sm",
        flexWrap: "wrap",
        justifyContent: "flex-end",
      })}
    >
      <button type="button" class={tagCardActionButton} onClick={handleSelectAll} disabled={allSelected()}>
        Select all
      </button>
      <button type="button" class={tagCardActionButton} onClick={handleClear} disabled={!hasSelection()}>
        Clear
      </button>
    </div>
  );
}
