import {
  ACTIVE_CITIZEN_WHERE,
  AuditEventType,
  getYesterdayDateColumnValue,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

export interface CountCitizensPerRoleInput {
  /**
   * The time of the run. The run counts the day before it in the time zone
   * of the organization.
   */
  readonly now: Date;
}

export interface CountCitizensPerRoleOutput {
  /** The number of roles that the run counted */
  readonly roleCount: number;
  /** The number of counts that the run saved. Zero for a repeated run. */
  readonly savedCount: number;
}

/**
 * Saves the number of active citizens of each role for the day that just
 * ended.
 */
export const countCitizensPerRole = (
  context: ApplicationContext,
  { now }: CountCitizensPerRoleInput,
): Promise<CountCitizensPerRoleOutput> =>
  withSpan(context, "countCitizensPerRole", async () => {
    const countedDay = getYesterdayDateColumnValue(now);

    const [roles, roleCounts] = await context.prisma.$transaction(
      async (transaction) => {
        const allRoles = await transaction.role.findMany({
          select: {
            id: true,
          },
        });
        const counts = await transaction.roleAssignment.groupBy({
          by: ["roleId"],
          where: { citizen: ACTIVE_CITIZEN_WHERE },
          _count: {
            citizenId: true,
          },
        });
        return [allRoles, counts] as const;
      },
    );

    const citizenCountByRoleId = new Map(
      roleCounts.map((roleCount) => [
        roleCount.roleId,
        roleCount._count.citizenId,
      ]),
    );

    const data = roles.map((role) => ({
      roleId: role.id,
      day: countedDay,
      count: citizenCountByRoleId.get(role.id) ?? 0,
    }));

    /**
     * A run that repeats in the same night (for example after an error in a
     * later job) keeps the counts of the first run, see
     * `RoleCitizenCount_roleId_day_key`. The first run is the nearest to the
     * end of the counted day.
     */
    const created = await context.prisma.roleCitizenCount.createMany({
      data,
      skipDuplicates: true,
    });

    await context.audit.create([
      {
        type: AuditEventType.CITIZENS_PER_ROLE_COUNTED,
        data: { roleCount: data.length },
        createdById: null,
      },
    ]);

    return { roleCount: data.length, savedCount: created.count };
  });
