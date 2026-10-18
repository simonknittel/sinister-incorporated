import type { ApplicationContext } from "../context.js";
import { getPaidAssignments, SALARY_ASSIGNMENTS_ARGS } from "./salaryRules.js";

/** A role with the number of citizens who get its salary */
export interface RoleForSalaries {
  readonly role: {
    readonly id: string;
    readonly name: string;
  };
  readonly citizenCount: number;
}

/**
 * All roles with the number of citizens who get their salary, for the
 * "citizens × SILC" preview of the salary editor. The same rule as the
 * salary job (see `getPaidAssignments()`). The editor renders the badge of a
 * role from its id, thus the role needs only its id and its name for the
 * sort.
 *
 * It has no permission check. Its only caller, the salary editor, is on the
 * SILC settings page, which requires `silcSetting;manage`.
 */
export const findRolesForSalaries = async (
  context: Pick<ApplicationContext, "prisma">,
): Promise<RoleForSalaries[]> => {
  const roles = await context.prisma.role.findMany({
    select: {
      id: true,
      name: true,
      maxLevel: true,
      assignments: SALARY_ASSIGNMENTS_ARGS,
    },
  });

  return roles.map((role) => ({
    role: { id: role.id, name: role.name },
    citizenCount: getPaidAssignments(role).length,
  }));
};
