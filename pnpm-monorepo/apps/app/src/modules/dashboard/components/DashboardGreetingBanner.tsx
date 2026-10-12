import { requireAuthentication } from "@/modules/auth/server";
import { BirthdayGreetingBanner } from "@/modules/citizen/components/BirthdayGreetingBanner";
import { WelcomeGreetingBanner } from "@/modules/onboarding/components/WelcomeGreetingBanner";
import { isWelcomeDay } from "@/modules/onboarding/queries/isWelcomeDay";
import { SeasonalGreetingBanner } from "@/modules/seasonal-events/components/SeasonalGreetingBanner";
import {
  getInGameYear,
  getLocalDate,
  ORGANIZATION_TIMEZONE,
} from "@sam-monorepo/domain";
import { getGreetingBannerPreview } from "../queries/getGreetingBannerPreview";
import { GreetingBannerPreview } from "../utils/GreetingBannerPreview";
import type { GreetingWordingContext } from "../utils/greetingWordings";

enum GreetingOccasion {
  Welcome = "welcome",
  Birthday = "birthday",
  Seasonal = "seasonal",
}

/**
 * The occasion of the banner. The occasions share one place, thus only the
 * first one of this order shows: the welcome on the first day of a new
 * member, the birthday of the viewer, the greeting day of the active
 * seasonal event.
 *
 * A preview of the admin toolbar replaces the order and shows the occasion
 * it names, also on a day without that occasion.
 */
const resolveGreetingOccasion = async (
  preview: GreetingBannerPreview | null,
  hasBirthdayToday: boolean,
): Promise<GreetingOccasion> => {
  switch (preview) {
    case GreetingBannerPreview.Welcome:
      return GreetingOccasion.Welcome;

    case GreetingBannerPreview.Birthday:
      return GreetingOccasion.Birthday;

    case null:
      break;

    default:
      throw new Error(
        `Unknown greeting banner preview: ${preview satisfies never}`,
      );
  }

  if (await isWelcomeDay()) return GreetingOccasion.Welcome;
  if (hasBirthdayToday) return GreetingOccasion.Birthday;
  return GreetingOccasion.Seasonal;
};

/**
 * The one greeting banner of the dashboard, see `resolveGreetingOccasion`
 * for the occasion which shows. The seasonal banner renders nothing outside
 * the greeting days of its event, thus the dashboard usually has no banner.
 *
 * A welcome or a birthday banner replaces only the seasonal banner: the
 * other seasonal decorations stay.
 */
export const DashboardGreetingBanner = async () => {
  const [authentication, preview] = await Promise.all([
    requireAuthentication(),
    getGreetingBannerPreview(),
  ]);
  const { entity } = authentication.session;

  const occasion = await resolveGreetingOccasion(
    preview,
    entity?.hasBirthdayToday ?? false,
  );

  // The seasonal banner names the in-game year of the date of its theme
  // instead, see `SeasonalGreetingBanner`.
  const context: GreetingWordingContext = {
    inGameYear: getInGameYear(
      getLocalDate(new Date(), ORGANIZATION_TIMEZONE).year,
    ),
    handle: entity?.handle ?? null,
  };

  switch (occasion) {
    case GreetingOccasion.Welcome:
      return <WelcomeGreetingBanner context={context} />;

    case GreetingOccasion.Birthday:
      return <BirthdayGreetingBanner context={context} />;

    case GreetingOccasion.Seasonal:
      return <SeasonalGreetingBanner context={context} />;

    default:
      throw new Error(`Unknown greeting occasion: ${occasion satisfies never}`);
  }
};
