"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteSilcTransactionInputSchema,
  deleteSilcTransaction as deleteSilcTransactionUseCase,
} from "@sam-monorepo/application";
import { SILC_ERROR_TEXTS } from "../utils/silcErrorTexts";

export const deleteSilcTransaction = createUseCaseAction({
  name: "deleteSilcTransaction",
  schema: deleteSilcTransactionInputSchema,
  useCase: deleteSilcTransactionUseCase,
  parseFormData: (formData) => ({ transaction_id: formData.get("id") }),
  texts: SILC_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
