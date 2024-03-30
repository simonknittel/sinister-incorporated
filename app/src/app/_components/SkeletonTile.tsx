import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const SkeletonTile = ({ className }: Props) => {
  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col animate-pulse min-h-[22.5rem]",
      )}
    />
  );
};
