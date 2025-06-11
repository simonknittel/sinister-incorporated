import clsx from "clsx";
import { Search } from "./Search";

interface Props {
  readonly className?: string;
}

export const SpynetSearchTile = ({ className }: Props) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-primary p-4 background-secondary flex flex-col gap-4 items-center w-full",
      )}
    >
      <h2 className="sr-only">Suche</h2>

      <Search />
    </section>
  );
};
