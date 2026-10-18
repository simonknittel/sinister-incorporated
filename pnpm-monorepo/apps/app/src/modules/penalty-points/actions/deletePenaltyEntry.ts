"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deletePenaltyEntryInputSchema,
  deletePenaltyEntry as deletePenaltyEntryUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";

export const deletePenaltyEntry = createAuthenticatedAction(
  "deletePenaltyEntry",
  deletePenaltyEntryInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deletePenaltyEntryUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, { formData, t });
    }

    refresh();

    return { success: t("Common.successfullyDeleted") };
  },
  {
    parseFormData: (formData) => ({
      penalty_entry_id: formData.get("id"),
    }),
  },
);
