import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const TileSkeleton = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "p-8 pb-10 bg-neutral-800/50 mt-4 rounded-2xl h-96 animate-pulse",
      )}
    />
  );
};
