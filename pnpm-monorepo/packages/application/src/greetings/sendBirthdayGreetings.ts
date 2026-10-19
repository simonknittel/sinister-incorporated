import { AuditEventType, CAN_LOGIN_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";
import { shouldGreetOnBirthday } from "./birthdayGreetingRule.js";

/**
 * Bounds one run's work against the time limit of the Lambda function.
 * Citizens above the limit keep their unset marker and are greeted by one of
 * the next runs.
 */
const MAXIMUM_BIRTHDAY_GREETINGS_PER_RUN = 100;

export interface SendBirthdayGreetingsOutput {
  /** The citizens with a birthday who can log in */
  readonly candidateCount: number;
  readonly greetedCount: number;
  readonly notificationsSent: boolean;
}

/**
 * Greets every citizen whose birthday starts in their own time zone. The run
 * happens every 15 minutes, thus a greeting arrives within 15 minutes after
 * the local midnight.
 *
 * The citizens are marked before the notifications go out: a crash in
 * between drops a greeting, which is better than sending it twice. A failed
 * request of the notifications keeps the markers, for the same reason.
 */
export const sendBirthdayGreetings = (
  context: ApplicationContext,
): Promise<SendBirthdayGreetingsOutput> =>
  withSpan(context, "sendBirthdayGreetings", async () => {
    const candidates = await context.prisma.citizen.findMany({
      where: {
        AND: [
          { birthdayDay: { not: null } },
          { birthdayMonth: { not: null } },
          CAN_LOGIN_CITIZEN_WHERE,
        ],
      },
      select: {
        id: true,
        timezone: true,
        birthdayDay: true,
        birthdayMonth: true,
        birthdayGreetingSentAt: true,
      },
    });

    const now = context.now();
    const greetable: typeof candidates = [];

    for (const candidate of candidates) {
      if (greetable.length >= MAXIMUM_BIRTHDAY_GREETINGS_PER_RUN) break;

      try {
        if (shouldGreetOnBirthday(candidate, now)) greetable.push(candidate);
      } catch (error) {
        // A time zone the runtime does not know must not stop the sibling
        // citizens or the sibling jobs of this Lambda function.
        context.log.warn("Failed to check the birthday of a citizen", {
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
      data: { birthdayGreetingSentAt: now },
    });

    const notificationsSent = await triggerNotificationsAfterSave(
      context,
      greetable.map((citizen) => ({
        type: "BirthdayGreeting",
        payload: { citizenId: citizen.id },
      })),
    );

    await context.audit.create([
      {
        type: AuditEventType.BIRTHDAY_GREETINGS_SENT,
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
