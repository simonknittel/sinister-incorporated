import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { idSchema } from "../pagination.js";

export const getLastSeenAtInputSchema = z.object({
  /** The login of the citizen, or null for a citizen without a login */
  user_id: idSchema.nullable(),
});

export type GetLastSeenAtInput = z.infer<typeof getLastSeenAtInputSchema>;

/**
 * The last time the login was active. Null without `lastSeen;read`, without
 * a login, and when the login was never active.
 */
export const getLastSeenAt = async (
  context: ApplicationContext,
  actor: Actor,
  input: GetLastSeenAtInput,
): Promise<Date | null> => {
  if (!actor.authorize("lastSeen", "read") || !input.user_id) return null;

  const user = await context.prisma.user.findUnique({
    where: { id: input.user_id },
    select: { lastSeenAt: true },
  });

  return user?.lastSeenAt ?? null;
};
