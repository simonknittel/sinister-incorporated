import { AuditEventType, CAN_LOGIN_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { withSpan } from "../withSpan.js";
import { shouldGreetOnBirthday } from "./birthdayGreetingRule.js";
import {
  greetCitizens,
  GreetingMarkerField,
  type GreetingRunOutput,
} from "./greetCitizens.js";

/** See `maximumPerRun` of `greetCitizens()` */
const MAXIMUM_BIRTHDAY_GREETINGS_PER_RUN = 100;

/**
 * Greets each citizen whose birthday starts in their own time zone (see
 * `greetCitizens()` for the run and the markers).
 */
export const sendBirthdayGreetings = (
  context: ApplicationContext,
): Promise<GreetingRunOutput> =>
  withSpan(context, "sendBirthdayGreetings", async () =>
    greetCitizens(context, {
      candidates: await context.prisma.citizen.findMany({
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
      }),
      maximumPerRun: MAXIMUM_BIRTHDAY_GREETINGS_PER_RUN,
      shouldGreet: shouldGreetOnBirthday,
      markerField: GreetingMarkerField.Birthday,
      toNotification: (citizen) => ({
        type: "BirthdayGreeting",
        payload: { citizenId: citizen.id },
      }),
      auditType: AuditEventType.BIRTHDAY_GREETINGS_SENT,
    }),
  );
