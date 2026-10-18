import type { Prisma } from "@sam-monorepo/database/client";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ROLE_BADGE_SELECT } from "./roleBadges.js";

const MANAGED_ROLE_SELECT = {
  ...ROLE_BADGE_SELECT,
  maxAgeDays: true,
  assignAfterInactiveDays: true,
  thumbnailId: true,
  permissionStrings: { select: { permissionString: true } },
  inherits: { select: { id: true } },
} as const satisfies Prisma.RoleSelect;

/** A role with the fields that the role pages edit */
export type ManagedRole = Prisma.RoleGetPayload<{
  select: typeof MANAGED_ROLE_SELECT;
}>;

/**
 * The role for the role pages, or null when it does not exist. Requires
 * `role;manage`.
 */
export const findManagedRole = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  roleId: string,
): Promise<ManagedRole | null> => {
  requirePermission(actor, "role", "manage");

  return context.prisma.role.findUnique({
    where: { id: roleId },
    select: MANAGED_ROLE_SELECT,
  });
};
