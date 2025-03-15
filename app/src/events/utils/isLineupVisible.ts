import type { Event } from "@prisma/client";
import { isAllowedToManagePositions } from "./isAllowedToManagePositions";

export const isLineupVisible = async (event: Event) => {
  return event.lineupEnabled || (await isAllowedToManagePositions(event));
};
