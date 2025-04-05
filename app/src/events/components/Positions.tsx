"use client";

import type {
  Entity,
  Manufacturer,
  Series,
  Ship,
  Variant,
} from "@prisma/client";
import { LineupOrderProvider } from "./LineupOrderContext/Context";
import { LineupVisibilityProvider, ToggleAll } from "./LineupVisibilityContext";
import { type PositionType } from "./Position";

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
    <LineupVisibilityProvider items={positions}>
      <ToggleAll className="ml-auto" />

      <LineupOrderProvider
        positions={positions}
        showManage={canManagePositions}
        variants={variants}
        myShips={myShips}
        allEventCitizens={allEventCitizens}
        showActions={showActions}
        showToggle={showToggle}
        className="flex flex-col gap-[1px]"
      />
    </LineupVisibilityProvider>
  );
};
