import clsx from "clsx";

interface Props {
  className?: string;
}

const RolesTileSkeleton = ({ className }: Readonly<Props>) => {
  return (
    <div
      className={clsx(
        className,
        "rounded-2xl bg-neutral-900/50 backdrop-blur animate-pulse min-h-[20rem] max-w-4xl",
      )}
    />
  );
};

export default RolesTileSkeleton;
