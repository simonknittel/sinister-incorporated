"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateSilcTransactionInputSchema,
  updateSilcTransaction as updateSilcTransactionUseCase,
} from "@sam-monorepo/application";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const updateSilcTransaction = createUseCaseAction({
  name: "updateSilcTransaction",
  schema: updateSilcTransactionInputSchema,
  useCase: updateSilcTransactionUseCase,
  parseFormData: (formData) => ({
    transaction_id: formData.get("transactionId"),
    value: Number(formData.get("value")),
    description: formData.has("description")
      ? formData.get("description")
      : undefined,
  }),
  texts: SILC_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
