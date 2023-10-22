import clsx from "clsx";

interface Props {
  className?: string;
}

const RolesTileSkeleton = ({ className }: Readonly<Props>) => {
  return (
    <div
      className={clsx(
        className,
        "rounded bg-neutral-900 animate-pulse min-h-[20rem] max-w-4xl",
      )}
    />
  );
};

export default RolesTileSkeleton;
