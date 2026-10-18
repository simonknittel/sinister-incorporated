import { CAN_LOGIN_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  getBirthdayCandidateDays,
  hasBirthdayTodaySafely,
} from "./birthdays.js";

/**
 * Each citizen who has the birthday today, in the own time zone. The app
 * shell loads this one time for each request and gives it to the browser,
 * thus a citizen link can wear the party hat without its own query.
 *
 * Only the ids go out. The audience is the one of the birthday list: an
 * actor without `citizen;read` gets nothing.
 */
export const listCitizenIdsWithBirthdayToday = async (
  context: ApplicationContext,
  actor: Actor,
): Promise<string[]> => {
  if (!actor.authorize("citizen", "read")) return [];

  const now = context.now();

  const candidates = await context.prisma.citizen.findMany({
    where: {
      AND: [{ OR: getBirthdayCandidateDays(now) }, CAN_LOGIN_CITIZEN_WHERE],
    },
    select: {
      id: true,
      timezone: true,
      birthdayDay: true,
      birthdayMonth: true,
    },
  });

  return candidates
    .filter((citizen) => hasBirthdayTodaySafely(context, citizen, now))
    .map((citizen) => citizen.id);
};
