import { Hero } from "@/common/components/Hero";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation/Navigation";

interface Props {
  readonly children: ReactNode;
  readonly mainClassName?: string;
}

export const Template = ({ children, mainClassName }: Props) => {
  return (
    <div className="p-4 pb-20 lg:pb-4">
      <div className="flex justify-center items-center gap-2 mb-4">
        <Hero text="IAM" withGlitch size="md" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Navigation className="md:w-64 md:flex-none" />

        <main className={clsx("md:flex-1", mainClassName)}>{children}</main>
      </div>
    </div>
  );
};
