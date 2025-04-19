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
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col gap-4 lg:gap-8 items-center w-full",
      )}
    >
      <h2 className="sr-only">Suche</h2>

      <Search />
    </section>
  );
};
