import clsx from "clsx";
import type { ReactNode } from "react";

interface Props {
  readonly className?: string;
  readonly heading: ReactNode;
  readonly cta?: ReactNode;
  readonly children: ReactNode;
  readonly childrenClassName?: string;
  readonly transparent?: boolean;
}

export const Tile = ({
  className,
  cta,
  heading,
  children,
  childrenClassName,
  transparent,
}: Props) => {
  return (
    <section
      className={clsx(
        { "rounded-2xl bg-neutral-800/50": !transparent },
        className,
      )}
    >
      <div
        className={clsx("flex justify-between items-center", {
          "border-b border-white/5": !transparent,
        })}
      >
        <h2
          className={clsx("font-thin text-2xl", {
            "p-4 lg:px-8": !transparent,
          })}
        >
          {heading}
        </h2>

        {cta && (
          <div className={clsx({ "pr-4 lg:pr-8": !transparent })}>{cta}</div>
        )}
      </div>

      <div
        className={clsx(
          { "mt-4 lg:mt-4": transparent, "p-4 lg:p-8": !transparent },
          childrenClassName,
        )}
      >
        {children}
      </div>
    </section>
  );
};
