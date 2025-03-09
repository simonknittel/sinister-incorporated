"use client";

import {
  type Entity,
  type Event,
  type Manufacturer,
  type Series,
  type Ship,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import dynamic from "next/dynamic";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import type { PositionType } from "./Position";
import { PositionSkeleton } from "./PositionSkeleton";
import { Unassigned } from "./Unassigned";

const Positions = dynamic(
  () => import("./Positions").then((mod) => mod.Positions),
  { ssr: false, loading: () => <PositionSkeleton /> },
);

type Props = Readonly<{
  className?: string;
  event: Event & {
    positions: PositionType[];
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
      <div className="flex justify-end">
        <h2 className="sr-only">Aufstellung</h2>
        {canManagePositions && (
          <CreateOrUpdateEventPosition eventId={event.id} variants={variants} />
        )}
      </div>

      <Unassigned
        positions={event.positions}
        allEventCitizens={allEventCitizens}
      />

      {event.positions.length > 0 ? (
        <Positions
          positions={event.positions}
          canManagePositions={canManagePositions}
          variants={variants}
          myShips={myShips}
          allEventCitizens={allEventCitizens}
          showActions={showActions}
          showToggle={showToggle}
        />
      ) : (
        <p className="rounded-2xl bg-neutral-800/50 p-4">
          Keine Posten vorhanden. Diese können vom Organisator des Events
          angelegt und zugeordnet werden.
        </p>
      )}
    </section>
  );
};
