import { Link } from "@/common/components/Link";
import type { Entity } from "@prisma/client";
import type { ReactNode } from "react";
import { CitizenNavigation } from "./CitizenNavigation";

interface Props {
  readonly citizen: Entity;
  readonly children: ReactNode;
}

export const Template = ({ citizen, children }: Props) => {
  return (
    <main className="px-4 pt-4 lg:pt-0 pb-20 lg:pb-0 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          &lt; Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <span className="text-neutral-500 flex gap-1 items-center">
          Citizen
        </span>

        <span className="text-neutral-500">/</span>

        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap">
          {citizen.handle || citizen.id}
        </h1>
      </div>

      <CitizenNavigation citizenId={citizen.id} className="mt-2 mb-4" />

      {children}
    </main>
  );
};
