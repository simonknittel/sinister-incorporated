import type { VariantTag } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  tag: VariantTag;
}>;

export const VariantTagBadge = ({ className, tag }: Props) => {
  return (
    <span
      key={tag.id}
      className={clsx(
        "rounded bg-neutral-700/50 px-2 py-1 flex flex-col overflow-hidden",
        className,
      )}
      title={`${tag.key}: ${tag.value}`}
    >
      <span className="text-xs text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap">
        {tag.key}
      </span>
      <span className="overflow-hidden whitespace-nowrap text-ellipsis">
        {tag.value}
      </span>
    </span>
  );
};
