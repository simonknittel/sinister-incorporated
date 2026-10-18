import { getApplicationContext } from "@/modules/application";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { getAuecConversionRate as getAuecConversionRateUseCase } from "@sam-monorepo/application";
import { cache } from "react";

export const getAuecConversionRate = cache(
  withTrace("getAuecConversionRate", () =>
    getAuecConversionRateUseCase(getApplicationContext()),
  ),
);
