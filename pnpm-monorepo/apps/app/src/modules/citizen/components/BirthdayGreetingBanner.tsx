import {
  GreetingBanner,
  GreetingBannerMarker,
} from "@/modules/dashboard/components/GreetingBanner";
import {
  pickRandomWording,
  type GreetingWordingContext,
} from "@/modules/dashboard/utils/greetingWordings";
import { BIRTHDAY_WORDINGS } from "../wordings/birthday";
import { BirthdayOrnament } from "./BirthdayOrnament";

interface Props {
  readonly context: GreetingWordingContext;
}

/**
 * The birthday greeting of the viewer. `DashboardGreetingBanner` decides
 * when it shows.
 */
export const BirthdayGreetingBanner = ({ context }: Props) => {
  const wording = pickRandomWording(BIRTHDAY_WORDINGS, context);
  if (!wording) return null;

  return (
    <GreetingBanner
      marker={GreetingBannerMarker.Birthday}
      surfaceClassName="background-birthday"
      hasConfetti
      ornament={<BirthdayOrnament className="size-full" />}
      title={wording.title}
      body={wording.body}
    />
  );
};
