import {
  AuditEventType,
  CAN_LOGIN_CITIZEN_WHERE,
  getLocalDate,
  ORGANIZATION_TIMEZONE,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";
import { shouldGreetForNewYear } from "./newYearGreetingRule.js";

/**
 * Bounds one run's work against the time limit of the Lambda function.
 * Almost every citizen of the organization turns the year within the same
 * quarter of an hour, thus the limit is much higher than the one of the
 * birthday greeting. Citizens above it keep their unset marker and are
 * greeted by one of the next runs.
 */
const MAXIMUM_NEW_YEAR_GREETINGS_PER_RUN = 500;

export interface SendNewYearGreetingsOutput {
  /** The citizens who can log in */
  readonly candidateCount: number;
  readonly greetedCount: number;
  readonly notificationsSent: boolean;
}

/**
 * Greets every citizen when January 1 starts in their own time zone. The run
 * happens every 15 minutes, thus a greeting arrives within 15 minutes after
 * the local midnight.
 *
 * The citizens are marked before the notifications go out: a crash in
 * between drops a greeting, which is better than sending it twice. A failed
 * request of the notifications keeps the markers, for the same reason.
 */
export const sendNewYearGreetings = (
  context: ApplicationContext,
): Promise<SendNewYearGreetingsOutput> =>
  withSpan(context, "sendNewYearGreetings", async () => {
    const candidates = await context.prisma.citizen.findMany({
      where: CAN_LOGIN_CITIZEN_WHERE,
      select: {
        id: true,
        timezone: true,
        newYearGreetingSentAt: true,
      },
    });

    const now = context.now();
    const greetable: typeof candidates = [];

    for (const candidate of candidates) {
      if (greetable.length >= MAXIMUM_NEW_YEAR_GREETINGS_PER_RUN) break;

      try {
        if (shouldGreetForNewYear(candidate, now)) greetable.push(candidate);
      } catch (error) {
        // A time zone the runtime does not know must not stop the sibling
        // citizens or the sibling jobs of this Lambda function.
        context.log.warn("Failed to check the turn of the year of a citizen", {
          citizenId: candidate.id,
          error,
        });
      }
    }

    if (greetable.length === 0) {
      return {
        candidateCount: candidates.length,
        greetedCount: 0,
        notificationsSent: true,
      };
    }

    await context.prisma.citizen.updateMany({
      where: { id: { in: greetable.map((citizen) => citizen.id) } },
      data: { newYearGreetingSentAt: now },
    });

    const notificationsSent = await triggerNotificationsAfterSave(
      context,
      greetable.map((citizen) => ({
        type: "NewYearGreeting",
        payload: {
          citizenId: citizen.id,
          // Saves the router from resolving the time zone a second time
          year: getLocalDate(now, citizen.timezone ?? ORGANIZATION_TIMEZONE)
            .year,
        },
      })),
    );

    await context.audit.create([
      {
        type: AuditEventType.NEW_YEAR_GREETINGS_SENT,
        data: { citizenCount: greetable.length },
        createdById: null,
      },
    ]);

    return {
      candidateCount: candidates.length,
      greetedCount: greetable.length,
      notificationsSent,
    };
  });
