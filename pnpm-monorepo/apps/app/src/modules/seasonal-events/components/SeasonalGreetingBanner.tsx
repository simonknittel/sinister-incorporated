import {
  GreetingBanner,
  GreetingBannerMarker,
} from "@/modules/dashboard/components/GreetingBanner";
import {
  pickRandomWording,
  type GreetingWordingContext,
} from "@/modules/dashboard/utils/greetingWordings";
import { getInGameYear } from "@sam-monorepo/domain";
import { getActiveSeasonalTheme } from "../queries/getActiveSeasonalTheme";

interface Props {
  readonly context: GreetingWordingContext;
}

/**
 * The greeting of the active seasonal event. It appears on the greeting days
 * of the event only and it disappears by itself.
 *
 * The in-game year of the wording comes from the date of the theme and not
 * from the context, because the seasonal date override can move that date.
 */
export const SeasonalGreetingBanner = async ({ context }: Props) => {
  const resolution = await getActiveSeasonalTheme();

  if (!resolution?.isGreetingDay) return null;

  const { theme, localDate } = resolution;

  const wording = pickRandomWording(theme.wordings, {
    ...context,
    inGameYear: getInGameYear(localDate.year),
  });
  if (!wording) return null;

  const { HeroOrnament } = theme;

  return (
    <GreetingBanner
      marker={GreetingBannerMarker.Seasonal}
      surfaceClassName={theme.bannerSurfaceClassName}
      hasConfetti={theme.hasConfetti}
      ornament={<HeroOrnament className="size-full" />}
      title={wording.title}
      body={wording.body}
    />
  );
};
