import {
  addDaysToLocalDate,
  AuditEventType,
  getLocalDate,
  getStartOfLocalDay,
  ORGANIZATION_TIMEZONE,
  toDateColumnValue,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";

export interface CountUniqueLoginsInput {
  /**
   * The time of the run. The run counts the day before it in the time zone
   * of the organization.
   */
  readonly now: Date;
}

export interface CountUniqueLoginsOutput {
  /** The counted day as "YYYY-MM-DD" */
  readonly date: string;
  readonly count: number;
  /** False when an earlier run saved the count of this day already */
  readonly saved: boolean;
}

/**
 * Saves the number of users who visited the app on the day that just ended.
 * The day starts and ends at midnight in the time zone of the organization.
 * The time zone of the process does not change the result.
 */
export const countUniqueLogins = (
  context: ApplicationContext,
  { now }: CountUniqueLoginsInput,
): Promise<CountUniqueLoginsOutput> =>
  withSpan(context, "countUniqueLogins", async () => {
    const today = getLocalDate(now, ORGANIZATION_TIMEZONE);
    const countedLocalDate = addDaysToLocalDate(today, -1);
    const startOfCountedDay = getStartOfLocalDay(
      countedLocalDate,
      ORGANIZATION_TIMEZONE,
    );
    const startOfToday = getStartOfLocalDay(today, ORGANIZATION_TIMEZONE);
    const countedDay = toDateColumnValue(countedLocalDate);
    const date = countedDay.toISOString().slice(0, 10);

    const count = await context.prisma.user.count({
      where: {
        lastSeenAt: {
          gte: startOfCountedDay,
          lt: startOfToday,
        },
      },
    });

    /**
     * A run that repeats later in the night (for example after an error in a
     * later job) keeps the count of the first run, see
     * `DailyLoginCount_date_key`. A user who visits again after midnight gets
     * a new `lastSeenAt` and is then not in the counted day anymore, thus the
     * first count is the most correct.
     */
    const created = await context.prisma.dailyLoginCount.createMany({
      data: [{ date: countedDay, count }],
      skipDuplicates: true,
    });
    if (created.count <= 0) return { date, count, saved: false };

    await context.audit.create([
      {
        type: AuditEventType.UNIQUE_LOGINS_COUNTED,
        data: {
          date: startOfCountedDay.toISOString(),
          count,
        },
        createdById: null,
      },
    ]);

    return { date, count, saved: true };
  });
