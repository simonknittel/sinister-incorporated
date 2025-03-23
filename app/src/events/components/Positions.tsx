"use client";

import type {
  Entity,
  Manufacturer,
  Series,
  Ship,
  Variant,
} from "@prisma/client";
import { LineupVisibilityProvider } from "./LineupVisibilityContext";
import { OpenAndCloseAll } from "./OpenAndCloseAll";
import { Position, type PositionType } from "./Position";

type Props = Readonly<{
  className?: string;
  positions: PositionType[];
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
    <LineupVisibilityProvider positions={positions}>
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
              groupLevel={1}
            />
          ))}
      </div>
    </LineupVisibilityProvider>
  );
};
