import { cornerstoneImageBrowserItemTypes } from "@/cornerstone-image-browser/utils/config";
import { Command } from "cmdk";
import { type Dispatch, type SetStateAction } from "react";
import { LinkItem } from "./Item";

interface Props {
  readonly setOpen: Dispatch<SetStateAction<boolean>>;
  readonly setSearch: Dispatch<SetStateAction<string>>;
}

export const CornerstoneImageBrowserPage = ({ setOpen, setSearch }: Props) => {
  return (
    <Command.Group
      heading={
        <div className="flex items-baseline gap-2">
          Cornerstone Image Browser
          <span className="text-neutral-700 text-xs">Tools</span>
        </div>
      }
    >
      {cornerstoneImageBrowserItemTypes.map((item) => (
        <LinkItem
          key={item.page}
          label={item.title}
          hideIconPlaceholder
          href={`/app/tools/cornerstone-image-browser/${item.page}`}
          setOpen={setOpen}
          setSearch={setSearch}
        />
      ))}
    </Command.Group>
  );
};
