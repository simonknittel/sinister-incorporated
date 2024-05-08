import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const TileSkeleton = ({ className }: Props) => {
  return (
    <section className={clsx(className, "flex flex-col gap-4 items-center")}>
      <h2 className="font-bold text-xl self-start">Kalender</h2>
      <div className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8 h-[160px] animate-pulse w-full" />
    </section>
  );
};
