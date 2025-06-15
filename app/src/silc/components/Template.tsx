import { Hero } from "@/common/components/Hero";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
  readonly children: ReactNode;
}

export const Template = ({ children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-6">
      <div className="flex justify-center">
        <Hero text="SILC" withGlitch size="md" />
      </div>

      <Navigation className="my-4" />

      {children}
    </main>
  );
};
