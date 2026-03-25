/** @jsxRuntime automatic */
/** @jsxImportSource solid-js */

import { useStore } from "@nanostores/solid";
import { $projectTags, toggleProjectTag } from "../../stores/projects";
import { chip } from "./Chip.css";

interface ProjectChipProps {
  value: string;
}

export default function ProjectChip(props: ProjectChipProps) {
  const { value } = props;
  const projectTags = useStore($projectTags);
  const isActive = () => projectTags().includes(value);

  const handleClick = () => {
    toggleProjectTag(value);
  };

  return (
    <button class={chip({ active: isActive() })} onClick={handleClick}>
      {value}
    </button>
  );
}
