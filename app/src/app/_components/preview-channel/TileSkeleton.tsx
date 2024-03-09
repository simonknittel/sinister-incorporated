import clsx from "clsx";

interface Props {
  className?: string;
}

export const TileSkeleton = ({ className }: Readonly<Props>) => {
  return (
    <div
      className={clsx(
        className,
        "rounded-2xl bg-neutral-900/50 backdrop-blur animate-pulse min-h-[10rem] w-full max-w-xl",
      )}
    />
  );
};
