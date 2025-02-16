"use client";

import {
  type DiscordEvent,
  type EventPosition,
  type EventPositionApplication,
} from "@prisma/client";
import clsx from "clsx";
import { CreateEventPosition } from "./CreateEventPosition";
import { Position } from "./Position";

type Props = Readonly<{
  className?: string;
  event: DiscordEvent & {
    positions: (EventPosition & {
      applications: EventPositionApplication[];
    })[];
  };
  canManagePositions?: boolean;
}>;

export const LineupTab = ({ className, event, canManagePositions }: Props) => {
  return (
    <div className={clsx("flex flex-col gap-4", className)}>
      <section className="rounded-2xl bg-neutral-800/50 p-4 lg:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold">Aufstellung</h2>
          {canManagePositions && <CreateEventPosition event={event} />}
        </div>

        {event.positions.length > 0 ? (
          <div className="flex flex-col gap-1">
            {event.positions
              .toSorted((a, b) => a.name.localeCompare(b.name))
              .map((position) => (
                <Position
                  key={position.id}
                  position={position}
                  showDelete={canManagePositions}
                />
              ))}
          </div>
        ) : (
          <p className="italic">Keine Positionen vorhanden.</p>
        )}
      </section>
    </div>
  );
};
