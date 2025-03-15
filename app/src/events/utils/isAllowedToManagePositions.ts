import { requireAuthentication } from "@/auth/server";
import type { Event } from "@prisma/client";

export const isAllowedToManagePositions = async (event: Event) => {
  const authentication = await requireAuthentication();

  if (event.discordCreatorId === authentication.session.discordId) return true;

  if (await authentication.authorize("othersEventPosition", "manage"))
    return true;

  return false;
};
