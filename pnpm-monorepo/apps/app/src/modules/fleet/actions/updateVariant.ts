"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateVariantInputSchema,
  updateVariant as updateVariantUseCase,
} from "@sam-monorepo/application";
import { parseVariantFieldsFormData } from "../utils/parseVariantFieldsFormData";

export const updateVariant = createUseCaseAction({
  name: "updateVariant",
  schema: updateVariantInputSchema,
  useCase: updateVariantUseCase,
  parseFormData: (formData) => ({
    variant_id: formData.get("id"),
    name: formData.get("name"),
    status: formData.get("status"),
    ...parseVariantFieldsFormData(formData),
  }),
  success: (t) => t("Common.successfullySaved"),
});
