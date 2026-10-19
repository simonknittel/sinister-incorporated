/**
 * Decides whether a citizen has to be greeted right now. Which day the
 * birthday of a citizen falls on in their own time zone is the shared rule
 * `isBirthdayToday`; the "only once per local year" part is the shared rule
 * of every greeting (see `hasGreetingInLocalYear`).
 */
import { isBirthdayToday, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import { hasGreetingInLocalYear } from "./greetingHistory.js";

export interface BirthdayGreetingCandidate {
  readonly timezone: string | null;
  readonly birthdayDay: number | null;
  readonly birthdayMonth: number | null;
  readonly birthdayGreetingSentAt: Date | null;
}

/**
 * True while it is the birthday of the citizen in their time zone and they
 * did not get a greeting in that local year yet.
 */
export const shouldGreetOnBirthday = (
  candidate: BirthdayGreetingCandidate,
  now: Date,
): boolean => {
  if (!isBirthdayToday(candidate, now)) return false;

  return !hasGreetingInLocalYear(
    candidate.birthdayGreetingSentAt,
    now,
    candidate.timezone ?? ORGANIZATION_TIMEZONE,
  );
};
