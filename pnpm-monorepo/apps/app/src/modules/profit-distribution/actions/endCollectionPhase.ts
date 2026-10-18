"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  endCollectionPhaseInputSchema,
  endCollectionPhase as endCollectionPhaseUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const endCollectionPhase = createAuthenticatedAction(
  "endCollectionPhase",
  endCollectionPhaseInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await endCollectionPhaseUseCase(
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
  { parseFormData: (formData) => ({ cycle_id: formData.get("id") }) },
);
