import { Hero } from "@/common/components/Hero";
import clsx from "clsx";
import { cloneElement, type ReactElement, type ReactNode } from "react";

interface Props {
  readonly title: string;
  readonly children: ReactNode;
  readonly childrenContainerClassName?: string;
  readonly sidebar: ReactElement;
}

export const Layout = ({
  title,
  children,
  childrenContainerClassName,
  sidebar,
}: Props) => {
  const _sidebar = cloneElement(sidebar, {
    // @ts-expect-error
    className: "md:w-64 md:flex-none",
  });

  return (
    <div className="p-4 pb-20 lg:pb-4">
      <div className="flex justify-center items-center gap-2 mb-4">
        <Hero text={title} withGlitch size="md" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {_sidebar}

        <main className={clsx("md:flex-1", childrenContainerClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
};
