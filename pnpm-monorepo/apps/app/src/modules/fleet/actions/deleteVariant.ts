"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteVariantInputSchema,
  deleteVariant as deleteVariantUseCase,
} from "@sam-monorepo/application";
import { FLEET_DELETE_ERROR_TEXTS } from "../utils/fleetErrorTexts";

export const deleteVariant = createUseCaseAction({
  name: "deleteVariant",
  schema: deleteVariantInputSchema,
  useCase: deleteVariantUseCase,
  parseFormData: (formData) => ({ variant_id: formData.get("id") }),
  texts: FLEET_DELETE_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
