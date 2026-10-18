"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  deleteSilcTransactionInputSchema,
  deleteSilcTransaction as deleteSilcTransactionUseCase,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const deleteSilcTransaction = createAuthenticatedAction(
  "deleteSilcTransaction",
  deleteSilcTransactionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await deleteSilcTransactionUseCase(
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

    return { success: t("Common.successfullyDeleted") };
  },
  { parseFormData: (formData) => ({ transaction_id: formData.get("id") }) },
);
