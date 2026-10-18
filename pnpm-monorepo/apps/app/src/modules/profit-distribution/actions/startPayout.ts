"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  startPayoutInputSchema,
  startPayout as startPayoutUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const startPayout = createAuthenticatedAction(
  "startPayout",
  startPayoutInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await startPayoutUseCase(
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

    return {
      success: t("Common.successfullySaved"),
      ...(result.notifications_sent
        ? {}
        : { warning: t("Common.notificationsFailed") }),
    };
  },
  {
    parseFormData: (formData) => ({
      cycle_id: formData.get("id"),
      // Without the field, the schema refuses the request (not the profit 0)
      auec_profit: formData.has("auecProfit")
        ? Number(formData.get("auecProfit"))
        : undefined,
      // An empty date field: the payout continues until a manager ends it
      payout_ends_at: formData.get("payoutEndsAt") || null,
    }),
  },
);
