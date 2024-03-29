import clsx from "clsx";

type Props = Readonly<{
  className?: string;
}>;

export const TileSkeleton = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        className,
        "rounded-2xl bg-neutral-800/50 p-4 lg:p-8 mt-4 h-96 animate-pulse",
      )}
    />
  );
};
