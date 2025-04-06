import { Hero } from "@/common/components/Hero";
import type { ReactNode } from "react";

type Props = Readonly<{
  children: ReactNode;
}>;

export const Template = ({ children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center">
        <Hero text="Tasks" withGlitch />
      </div>

      {children}
    </main>
  );
};
