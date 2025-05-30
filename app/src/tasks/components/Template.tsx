import { Hero } from "@/common/components/Hero";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { NotificationsTooltip } from "./NotificationsTooltip";

interface Props {
  readonly children: ReactNode;
}

export const Template = ({ children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center mb-4">
        <Hero text="Tasks" withGlitch />
      </div>

      <div className="flex gap-2 justify-center items-center">
        <Navigation className="my-4" />
        <NotificationsTooltip />
      </div>

      {children}
    </main>
  );
};
