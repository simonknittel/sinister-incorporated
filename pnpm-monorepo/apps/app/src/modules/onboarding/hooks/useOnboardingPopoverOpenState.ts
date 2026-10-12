"use client";

import { useEffect, useState } from "react";
import { useOnboarding } from "../components/OnboardingProvider";

/**
 * The open state of one surface of the "Erste Schritte" popover. While a
 * request of `requestPopoverOpen()` is pending and the surface can act, the
 * popover opens and the request settles. A popover which is open already
 * stays open.
 *
 * Only one surface at a time can act, otherwise two popovers open.
 */
export const useOnboardingPopoverOpenState = (canActOnRequest: boolean) => {
  const { isPopoverOpenRequested, settlePopoverOpenRequest } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);

  const isActingOnRequest = isPopoverOpenRequested && canActOnRequest;
  if (isActingOnRequest && !isOpen) setIsOpen(true);

  useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-event-handler -- The request comes from a different component (for example the welcome banner), thus this surface has no event of its own. React does not let a render change the state of the provider, thus the effect settles the request after the render that opened the popover.
    if (isActingOnRequest) settlePopoverOpenRequest();
  }, [isActingOnRequest, settlePopoverOpenRequest]);

  return { isOpen, setIsOpen };
};
