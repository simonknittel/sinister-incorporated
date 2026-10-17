import { EventVisibility } from "@sam-monorepo/database/browser";
import type { ApplicationContext } from "../context.js";
import { EventValidationError, EventValidationProblem } from "./eventErrors.js";

/**
 * The visibility roles that an event write stores: the roles of a restricted
 * event (at least one, and each must exist), none for a public event
 */
export const resolveVisibilityRoleIds = async (
  context: ApplicationContext,
  visibility: EventVisibility,
  roleIds: readonly string[],
): Promise<string[]> => {
  if (visibility !== EventVisibility.RESTRICTED) return [];

  const uniqueRoleIds = Array.from(new Set(roleIds));
  if (uniqueRoleIds.length <= 0)
    throw new EventValidationError(EventValidationProblem.NoVisibilityRole);

  const existingRoleCount = await context.prisma.role.count({
    where: { id: { in: uniqueRoleIds } },
  });
  if (existingRoleCount !== uniqueRoleIds.length)
    throw new EventValidationError(
      EventValidationProblem.UnknownVisibilityRole,
    );

  return uniqueRoleIds;
};
