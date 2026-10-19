import { getLocalDateKey, ORGANIZATION_TIMEZONE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";

export interface IsWelcomeDayOfCitizenInput {
  readonly citizenId: string;
}

/**
 * Whether today is the welcome day of the citizen: the local day of
 * `welcomedAt` in the time zone of the citizen, with the time zone of the
 * organization as the fallback. A citizen who was not welcomed yet has no
 * welcome day. Takes no actor and checks no permission: the caller passes
 * the citizen of the session.
 *
 * No page must fail because of a greeting. Thus the function never throws: a
 * failed read or a time zone which the runtime does not know gives no
 * welcome day.
 */
export const isWelcomeDayOfCitizen = async (
  context: ApplicationContext,
  input: IsWelcomeDayOfCitizenInput,
): Promise<boolean> => {
  try {
    const citizen = await context.prisma.citizen.findUnique({
      where: { id: input.citizenId },
      select: { welcomedAt: true, timezone: true },
    });
    if (!citizen?.welcomedAt) return false;

    const timeZone = citizen.timezone ?? ORGANIZATION_TIMEZONE;

    return (
      getLocalDateKey(citizen.welcomedAt, timeZone) ===
      getLocalDateKey(context.now(), timeZone)
    );
  } catch (error) {
    context.log.warn("Failed to resolve the welcome day", {
      citizenId: input.citizenId,
      error,
    });

    return false;
  }
};
