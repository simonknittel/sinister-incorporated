import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  listOwnerShips,
  ownerShipsInputShape,
  type ListShipsOutput,
} from "./ownerShips.js";

export const listCitizenShipsInputSchema = z.object({
  citizen_id: z.cuid(),
  ...ownerShipsInputShape,
});

/** The ships of a citizen, for the fleet page of the citizen */
export const listCitizenShips = async (
  context: ApplicationContext,
  actor: Actor,
  { citizen_id, ...input }: z.infer<typeof listCitizenShipsInputSchema>,
): Promise<ListShipsOutput> => {
  requirePermission(actor, "otherShips", "read");

  return listOwnerShips(context, citizen_id, input);
};
