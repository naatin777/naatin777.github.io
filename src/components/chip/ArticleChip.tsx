/** @jsxRuntime automatic */
/** @jsxImportSource solid-js */

import { useStore } from "@nanostores/solid";
import { $articleTags, toggleArticleTag } from "../../stores/articles";
import { chip } from "./Chip.css";

interface ArticleChipProps {
  value: string;
}

export default function ArticleChip(props: ArticleChipProps) {
  const { value } = props;
  const articleTags = useStore($articleTags);
  const isActive = () => articleTags().includes(value);

  const handleClick = () => {
    toggleArticleTag(value);
  };

  return (
    <button class={chip({ active: isActive() })} onClick={handleClick}>
      {value}
    </button>
  );
}
