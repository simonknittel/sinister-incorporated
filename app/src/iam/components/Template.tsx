import { Hero } from "@/common/components/Hero";
import { isOpenAIEnabled } from "@/common/utils/isOpenAIEnabled";
import clsx from "clsx";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
  readonly children: ReactNode;
  readonly mainClassName?: string;
}

export const Template = async ({ children, mainClassName }: Props) => {
  const _isOpenAIEnabled = await isOpenAIEnabled("RoleNameSuggestions");

  return (
    <div className="p-4 pb-20 lg:pb-4">
      <div className="flex justify-center items-center gap-2 mb-4">
        <Hero text="IAM" withGlitch size="md" />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Navigation
          isOpenAIEnabled={_isOpenAIEnabled}
          className="md:w-64 md:flex-none"
        />

        <main className={clsx("md:flex-1", mainClassName)}>{children}</main>
      </div>
    </div>
  );
};
