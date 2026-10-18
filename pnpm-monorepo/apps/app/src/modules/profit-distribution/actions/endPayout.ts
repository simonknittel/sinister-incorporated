"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  endPayoutInputSchema,
  endPayout as endPayoutUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const endPayout = createAuthenticatedAction(
  "endPayout",
  endPayoutInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await endPayoutUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: getProfitDistributionErrorTexts(t),
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  { parseFormData: (formData) => ({ cycle_id: formData.get("id") }) },
);
