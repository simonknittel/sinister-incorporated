import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  readonly className?: string;
  readonly children: ReactNode;
  readonly label: ReactNode;
}

export const StatisticTile = ({ className, children, label }: Props) => {
  return (
    <div
      className={clsx(
        "rounded-primary background-secondary p-4 flex flex-col items-center",
        className,
      )}
    >
      <span className="font-black text-4xl">{children}</span>
      <p className="text-neutral-500">{label}</p>
    </div>
  );
};
