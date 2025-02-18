"use client";

import {
  type DiscordEvent,
  type Entity,
  type EventPosition,
  type EventPositionApplication,
  type Manufacturer,
  type Series,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import { Position } from "./Position";

type Props = Readonly<{
  className?: string;
  event: DiscordEvent & {
    positions: (EventPosition & {
      applications: (EventPositionApplication & {
        citizen: Entity;
      })[];
      acceptedApplication:
        | (EventPositionApplication & {
            citizen: Entity;
          })
        | null;
    })[];
  };
  canManagePositions?: boolean;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}>;

export const LineupTab = ({
  className,
  event,
  canManagePositions,
  variants,
}: Props) => {
  return (
    <section className={clsx("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Aufstellung</h2>
        {canManagePositions && (
          <CreateOrUpdateEventPosition event={event} variants={variants} />
        )}
      </div>

      {event.positions.length > 0 ? (
        <div className="flex flex-col gap-[1px]">
          {event.positions
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((position) => (
              <Position
                key={position.id}
                position={position}
                showManage={canManagePositions}
                variants={variants}
              />
            ))}
        </div>
      ) : (
        <p className="italic">
          Keine Posten vorhanden. Diese können vom Organisator des Events
          angelegt und zugeordnet werden.
        </p>
      )}
    </section>
  );
};
