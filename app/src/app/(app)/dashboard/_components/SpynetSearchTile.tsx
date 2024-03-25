import clsx from "clsx";
import { Hero } from "../../../_components/Hero";
import Search from "../../spynet/search/_components/Search";

type Props = Readonly<{
  className?: string;
}>;

export const SpynetSearchTile = ({ className }: Props) => {
  return (
    <section className={clsx(className, "flex flex-col items-center gap-4")}>
      <Hero text="Spynet" size="md" />

      <div className="rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col gap-4 lg:gap-8 items-center w-full">
        <Search />
      </div>
    </section>
  );
};
