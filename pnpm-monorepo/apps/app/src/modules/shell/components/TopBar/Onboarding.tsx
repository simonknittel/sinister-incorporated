"use client";

import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";
import { UnreadDot } from "@/modules/common/components/UnreadDot";
import { OnboardingPopoverContent } from "@/modules/onboarding/components/OnboardingPopoverContent";
import { useOnboarding } from "@/modules/onboarding/components/OnboardingProvider";
import { useIsLargeViewport } from "@/modules/onboarding/hooks/useIsLargeViewport";
import { useOnboardingPopoverOpenState } from "@/modules/onboarding/hooks/useOnboardingPopoverOpenState";
import { FaShoePrints } from "react-icons/fa";

export const Onboarding = () => {
  const { eligibleTasks } = useOnboarding();
  if (eligibleTasks.length === 0) return null;

  return <OnboardingPopover />;
};

const OnboardingPopover = () => {
  const { openTaskCount } = useOnboarding();
  /** The top bar, and thus the trigger, shows only on a large viewport */
  const isLargeViewport = useIsLargeViewport();
  const { isOpen, setIsOpen } = useOnboardingPopoverOpenState(isLargeViewport);

  return (
    <PopoverBaseUI
      title="Erste Schritte"
      trigger={
        <>
          <FaShoePrints className="rotate-270" />
          {openTaskCount > 0 && <UnreadDot className="ml-1" />}
        </>
      }
      triggerClassName="h-full px-4 flex items-center text-neutral-500 hover:bg-tertiary hover:text-white focus-visible:bg-tertiary focus-visible:text-white cursor-pointer"
      triggerTitle="Erste Schritte"
      childrenClassName="w-96"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <OnboardingPopoverContent />
    </PopoverBaseUI>
  );
};
