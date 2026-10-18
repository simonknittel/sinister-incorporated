"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createProfitDistributionCycleInputSchema,
  createProfitDistributionCycle as createProfitDistributionCycleUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getProfitDistributionErrorTexts } from "../utils/profitDistributionErrorTexts";

export const createProfitDistributionCycle = createAuthenticatedAction(
  "createProfitDistributionCycle",
  createProfitDistributionCycleInputSchema,
  async (formData, authentication, data, t) => {
    let result;
    try {
      result = await createProfitDistributionCycleUseCase(
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

    redirect(`/app/sincome/${result.id}`);
  },
  {
    parseFormData: (formData) => ({
      title: formData.get("title"),
      // Without the field, the schema refuses the request (not the date 1970)
      collection_ends_at: formData.get("collectionEndsAt") ?? undefined,
    }),
  },
);
