import type { Entity, Event } from "@prisma/client";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

type Props = Readonly<{
  event: Event & {
    managers: Entity[];
  };
  children: ReactNode;
}>;

export const Template = ({ event, children }: Props) => {
  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.name}</p>
      </div>

      <Navigation event={event} className="my-4" />

      {children}
    </main>
  );
};
