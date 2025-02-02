import clsx from "clsx";
import { type ReactNode } from "react";

type Props = Readonly<{
  className?: string;
  children: ReactNode;
}>;

export const RichText = ({ className, children }: Props) => {
  return (
    <div className={clsx(className, "prose prose-invert")}>{children}</div>
  );
};
