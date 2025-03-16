import clsx from "clsx";
import type { ReactNode } from "react";

type Props = Readonly<{
  className?: string;
  heading: ReactNode;
  cta?: ReactNode;
  children: ReactNode;
  childrenClassName?: string;
}>;

export const Tile = ({
  className,
  cta,
  heading,
  children,
  childrenClassName,
}: Props) => {
  return (
    <section className={clsx("rounded-2xl bg-neutral-800/50", className)}>
      <div className="flex justify-between items-center border-b border-white/5">
        <h2 className="font-bold text-xl p-4 lg:px-8">{heading}</h2>

        {cta && <div className="pr-4 lg:pr-8">{cta}</div>}
      </div>

      <div className={clsx("p-4 lg:p-8", childrenClassName)}>{children}</div>
    </section>
  );
};
