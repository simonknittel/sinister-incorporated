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
  allEventCitizens: { citizen: Entity; ships: Ship[] }[];
  showActions?: boolean;
  showToggle?: boolean;
}>;

export const LineupTab = ({
  className,
  event,
  canManagePositions,
  variants,
  myShips,
  allEventCitizens,
  showActions,
  showToggle,
}: Props) => {
  return (
    <section className={clsx("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-lg">Aufstellung</h2>
        {canManagePositions && (
          <CreateOrUpdateEventPosition event={event} variants={variants} />
        )}
      </div>

      <Unassigned
        positions={event.positions}
        allEventCitizens={allEventCitizens}
      />

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
                allEventCitizens={allEventCitizens}
                showActions={showActions}
                showToggle={showToggle}
              />
            ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-neutral-800/50 p-4">
          Keine Posten vorhanden. Diese können vom Organisator des Events
          angelegt und zugeordnet werden.
        </p>
      )}
    </section>
  );
};
