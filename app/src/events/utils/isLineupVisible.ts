import type { Entity, Event } from "@prisma/client";
import { isAllowedToManagePositions } from "./isAllowedToManagePositions";

export const isLineupVisible = async (
  event: Event & {
    managers: Entity[];
  },
) => {
  return event.lineupEnabled || (await isAllowedToManagePositions(event));
};
