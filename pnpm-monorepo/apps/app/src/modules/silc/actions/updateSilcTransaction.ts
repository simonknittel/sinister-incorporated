"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateSilcTransactionInputSchema,
  updateSilcTransaction as updateSilcTransactionUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const updateSilcTransaction = createAuthenticatedAction(
  "updateSilcTransaction",
  updateSilcTransactionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateSilcTransactionUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: SILC_ERROR_TEXTS,
      });
    }

    refresh();

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({
      transaction_id: formData.get("transactionId"),
      value: Number(formData.get("value")),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
    }),
  },
);
