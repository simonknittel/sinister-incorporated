"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createVariantInputSchema,
  createVariant as createVariantUseCase,
} from "@sam-monorepo/application";
import { parseVariantFieldsFormData } from "../utils/parseVariantFieldsFormData";

/** The hidden field `manufacturerId` of the form is not an input */
export const createVariant = createUseCaseAction({
  name: "createVariant",
  schema: createVariantInputSchema,
  useCase: createVariantUseCase,
  parseFormData: (formData) => ({
    series_id: formData.get("seriesId"),
    name: formData.get("name"),
    status: formData.has("status") ? formData.get("status") : undefined,
    ...parseVariantFieldsFormData(formData),
  }),
  success: (t) => t("Common.successfullySaved"),
});
