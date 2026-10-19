import {
  getActiveSeasonalEvent,
  getLocalDate,
  isSeasonalGreetingDay,
  ORGANIZATION_TIMEZONE,
  SeasonalEventKey,
  type LocalDate,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";

export interface FindSeasonalThemeInput {
  /** Null for a viewer without a citizen, for example the login page */
  readonly citizenId: string | null;
  /**
   * The date that the date override of the app names. Null without an
   * override.
   */
  readonly overrideDate: LocalDate | null;
}

export interface SeasonalThemeResult {
  readonly event: SeasonalEventKey;
  /** The date the theme was resolved for, in the time zone of the viewer */
  readonly localDate: LocalDate;
  /** Whether the event shows its greeting banner on that date */
  readonly isGreetingDay: boolean;
}

/** The values of a citizen which the resolution needs */
interface ViewerCitizen {
  readonly timezone: string | null;
  readonly switchedOffEventKeys: readonly string[];
}

/** A viewer without a citizen, for example the login page */
const VIEWER_WITHOUT_CITIZEN: ViewerCitizen = {
  timezone: null,
  switchedOffEventKeys: [],
};

/**
 * The time zone and the opt-outs of the citizen. No page must fail because
 * of a decoration, and this read is the only one the resolution makes, thus
 * a failed read — a release which arrives before its migration, for example
 * — yields no citizen and therefore no theme.
 */
const readViewerCitizen = async (
  context: ApplicationContext,
  citizenId: string,
): Promise<ViewerCitizen | null> => {
  try {
    const citizen = await context.prisma.citizen.findUnique({
      where: { id: citizenId },
      select: {
        timezone: true,
        seasonalThemeSettings: {
          // The event key is a free string in the database, thus the
          // query keeps the rows of the known events only.
          where: { eventKey: { in: Object.values(SeasonalEventKey) } },
          select: { eventKey: true },
        },
      },
    });
    if (!citizen) return null;

    return {
      timezone: citizen.timezone,
      switchedOffEventKeys: citizen.seasonalThemeSettings.map(
        (setting) => setting.eventKey,
      ),
    };
  } catch (error) {
    context.log.warn("Failed to read the citizen of the seasonal theme", {
      citizenId,
      error,
    });

    return null;
  }
};

/**
 * The date of the viewer, in their own time zone. The shared rule throws for
 * a time zone the runtime does not know, and no page must fail because of a
 * decoration; such a viewer gets no theme.
 */
const getViewerLocalDate = (
  context: ApplicationContext,
  timezone: string | null,
  citizenId: string | null,
): LocalDate | null => {
  try {
    return getLocalDate(context.now(), timezone ?? ORGANIZATION_TIMEZONE);
  } catch (error) {
    context.log.warn(
      "Failed to resolve the local date for the seasonal theme",
      {
        citizenId,
        error,
      },
    );

    return null;
  }
};

/**
 * The seasonal theme of a viewer, or null outside every theme range. Takes no
 * actor and checks no permission: the theme is a decoration, and the login
 * page asks for it too. A viewer without a citizen resolves with the time
 * zone of the organization and without opt-outs.
 *
 * No page must fail because of a decoration. Thus the function never throws:
 * a failed read or a time zone which the runtime does not know gives no
 * theme.
 */
export const findSeasonalTheme = async (
  context: ApplicationContext,
  input: FindSeasonalThemeInput,
): Promise<SeasonalThemeResult | null> => {
  const citizen = input.citizenId
    ? await readViewerCitizen(context, input.citizenId)
    : VIEWER_WITHOUT_CITIZEN;
  // A citizen the read could not give leaves the theme out: neither their
  // time zone nor their opt-outs are known.
  if (!citizen) return null;

  const localDate =
    input.overrideDate ??
    getViewerLocalDate(context, citizen.timezone, input.citizenId);
  if (!localDate) return null;

  const event = getActiveSeasonalEvent(localDate);
  if (!event) return null;

  if (citizen.switchedOffEventKeys.includes(event)) return null;

  return {
    event,
    localDate,
    isGreetingDay: isSeasonalGreetingDay(event, localDate),
  };
};
