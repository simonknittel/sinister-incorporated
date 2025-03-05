"use client";

import type {
  Entity,
  EventPosition,
  EventPositionApplication,
  Manufacturer,
  Series,
  Ship,
  Upload,
  Variant,
} from "@prisma/client";
import { LineupProvider } from "./LineupContext";
import { OpenAndCloseAll } from "./OpenAndCloseAll";
import { Position } from "./Position";

type Props = Readonly<{
  className?: string;
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

export const Positions = ({
  positions,
  canManagePositions,
  variants,
  myShips,
  allEventCitizens,
  showActions,
  showToggle,
}: Props) => {
  return (
    <LineupProvider positions={positions}>
      <OpenAndCloseAll className="ml-auto" />

      <div className="flex flex-col gap-[1px]">
        {positions
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
    </LineupProvider>
  );
};
