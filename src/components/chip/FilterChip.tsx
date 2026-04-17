import { NuqsAdapter } from "nuqs/adapters/react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { chip } from "@components/chip/Chip.css";

type QueryKey = "articleTags" | "projectTags";

interface FilterChipProps {
  value: string;
  queryKey: QueryKey;
}

const tagParser = parseAsArrayOf(parseAsString).withDefault([]);

function FilterChipContent({ value, queryKey }: FilterChipProps) {
  const [selectedTags, setSelectedTags] = useQueryState(queryKey, tagParser);
  const isActive = selectedTags.includes(value);

  const handleClick = (): void => {
    const nextTags = isActive ? selectedTags.filter((currentTag) => currentTag !== value) : [...selectedTags, value];

    void setSelectedTags(nextTags.length > 0 ? nextTags : null);
  };

  return (
    <button type="button" className={chip({ active: isActive })} aria-pressed={isActive} onClick={handleClick}>
      {value}
    </button>
  );
}

export default function FilterChip(props: FilterChipProps) {
  return (
    <NuqsAdapter>
      <FilterChipContent {...props} />
    </NuqsAdapter>
  );
}
