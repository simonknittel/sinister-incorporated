import type { Prisma } from "@sam-monorepo/database/client";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export const ROLE_SALARY_SELECT = {
  id: true,
  roleId: true,
  value: true,
  dayOfMonth: true,
} as const satisfies Prisma.SilcRoleSalarySelect;

/** A salary of a role in the salary editor */
export type RoleSalaryRow = Prisma.SilcRoleSalaryGetPayload<{
  select: typeof ROLE_SALARY_SELECT;
}>;

/**
 * All salaries of the roles. Requires `silcSetting;manage`, like the page of
 * the salary editor.
 */
export const findRoleSalaryRows = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<RoleSalaryRow[]> => {
  requirePermission(actor, "silcSetting", "manage");

  return context.prisma.silcRoleSalary.findMany({ select: ROLE_SALARY_SELECT });
};
