"use client";

import { Button2 } from "@/modules/common/components/Button2";
import { FaShoePrints } from "react-icons/fa";
import { useOnboarding } from "./OnboardingProvider";

/**
 * Opens the "Erste Schritte" popover from the welcome banner. A citizen
 * without an onboarding task has nothing to open, thus the button is then
 * not there and the banner shows only its greeting.
 */
export const WelcomeBannerCallToAction = () => {
  const { eligibleTasks, requestPopoverOpen } = useOnboarding();
  if (eligibleTasks.length === 0) return null;

  return (
    <Button2 type="button" onClick={requestPopoverOpen} data-welcome-banner-cta>
      {/* The icon of the popover trigger in the top bar */}
      <FaShoePrints className="rotate-270" aria-hidden />
      Lerne das SAM kennen
    </Button2>
  );
};
