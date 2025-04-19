import { Hero } from "@/common/components/Hero";
import type { ReactNode } from "react";

interface Props {
  readonly children: ReactNode;
}

export const Template = ({ children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center mb-4">
        <Hero text="Tasks" withGlitch />
      </div>

      {/* TODO: Reenable once history is implemented */}
      {/* <Navigation className="my-4" /> */}

      {children}
    </main>
  );
};
