import type { Role } from "@prisma/client";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
  readonly role: Role & {
    inherits: Role[];
  };
  readonly children: ReactNode;
}

export const Template = ({ role, children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Rolle /</span>
        <p>{role?.name}</p>
      </div>

      <Navigation role={role} className="my-4" />

      {children}
    </main>
  );
};
