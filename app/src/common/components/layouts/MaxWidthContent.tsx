import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  readonly className?: string;
  readonly children: ReactNode;
}

export const MaxWidthContent = ({ className, children }: Props) => {
  return (
    <div className={clsx("max-w-screen-3xl mx-auto p-4", className)}>
      {children}
    </div>
  );
};
