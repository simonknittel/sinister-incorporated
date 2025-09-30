"use client";

import { Button2 } from "@/modules/common/components/Button2";
import { Link } from "@/modules/common/components/Link";
import clsx from "clsx";
import type { AppList } from "../utils/types";

interface Props {
  readonly className?: string;
  readonly appLinks?: AppList | null;
  readonly selectedTags?: string[];
}

export const Filters = ({ className, appLinks, selectedTags }: Props) => {
  const filters = new Map<string, string>();
  filters.set("all", "Alle");
  for (const appLink of appLinks || []) {
    if ("tags" in appLink && appLink.tags?.length) {
      for (const tag of appLink.tags) {
        filters.set(tag, tag);
      }
    }
  }

  return (
    <div className={clsx("flex flex-wrap gap-2 justify-center", className)}>
      {Array.from(filters).map(([key, label]) => (
        <Button2
          as={Link}
          href={`/app/apps?tag=${key}`}
          variant={selectedTags?.includes(key) ? "primary" : "secondary"}
          key={key}
        >
          {label.charAt(0).toUpperCase() + label.slice(1)}
        </Button2>
      ))}
    </div>
  );
};
