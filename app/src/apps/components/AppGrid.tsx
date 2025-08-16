import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  readonly className?: string;
  readonly children: ReactNode;
}

export const AppGrid = ({ className, children }: Props) => {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-4",
        className,
      )}
    >
      {children}
    </div>
  );
};
