import type { Entity, Event } from "@prisma/client";
import type { ReactNode } from "react";
import { Navigation } from "./Navigation";

interface Props {
  readonly event: Event & {
    managers: Entity[];
  };
  readonly children: ReactNode;
}

export const Template = ({ event, children }: Props) => {
  return (
    <div className="max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <span className="text-neutral-500">Event /</span>
        <p>{event.name}</p>
      </div>

      <Navigation event={event} className="my-4" />

      {children}
    </div>
  );
};
