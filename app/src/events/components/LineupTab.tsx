"use client";

import {
  type Entity,
  type Event,
  type EventPosition,
  type EventPositionApplication,
  type Manufacturer,
  type Series,
  type Ship,
  type Upload,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import { PositionSkeleton } from "./PositionSkeleton";
import { Unassigned } from "./Unassigned";

const Position = dynamic(
  () => import("./Position").then((mod) => mod.Position),
  { ssr: false, loading: () => <PositionSkeleton /> },
);

type Props = Readonly<{
  className?: string;
  event: Event & {
    positions: (EventPosition & {
      applications: (EventPositionApplication & {
        citizen: Entity;
      })[];
      requiredVariant:
        | (Variant & {
            series: Series & {
              manufacturer: Manufacturer & {
                image: Upload | null;
              };
            };
          })
        | null;
      citizen: Entity | null;
    })[];
  };
  canManagePositions?: boolean;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
  myShips: Ship[];
  allEventCitizen: Entity[];
}>;

export const LineupTab = ({
  className,
  event,
  canManagePositions,
  variants,
  myShips,
  allEventCitizen,
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
                myShips={myShips}
                allEventCitizen={allEventCitizen}
              />
            ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-neutral-800/50 p-4">
          Keine Posten vorhanden. Diese können vom Organisator des Events
          angelegt und zugeordnet werden.
        </p>
      )}

      <Unassigned
        positions={event.positions}
        allEventCitizen={allEventCitizen}
      />
    </section>
  );
};
