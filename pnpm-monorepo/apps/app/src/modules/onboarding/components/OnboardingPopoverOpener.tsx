"use client";

import { ONBOARDING_POPOVER_SEARCH_PARAM } from "@sam-monorepo/notifications";
import { useQueryState } from "nuqs";
import { useEffect } from "react";
import { useOnboarding } from "./OnboardingProvider";

/**
 * Opens the "Erste Schritte" popover when the URL has the query parameter
 * `ONBOARDING_POPOVER_SEARCH_PARAM`, for example from the welcome
 * notification. Then it removes the parameter, thus a reload does not open
 * the popover again.
 */
export const OnboardingPopoverOpener = () => {
  const [searchParamValue, setSearchParamValue] = useQueryState(
    ONBOARDING_POPOVER_SEARCH_PARAM,
    { history: "replace", scroll: false },
  );
  const { requestPopoverOpen } = useOnboarding();

  useEffect(() => {
    if (searchParamValue === null) return;

    requestPopoverOpen();
    void setSearchParamValue(null);
  }, [searchParamValue, requestPopoverOpen, setSearchParamValue]);

  return null;
};
