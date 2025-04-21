import clsx from "clsx";

interface Props {
  readonly className?: string;
}

export const PositionSkeleton = ({ className }: Props) => {
  return (
    <div
      className={clsx(
        "rounded bg-neutral-800/50 h-14 animate-pulse",
        className,
      )}
    />
  );
};
