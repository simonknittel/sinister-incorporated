"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateManufacturer,
  updateManufacturerInputSchema,
} from "@sam-monorepo/application";

export const updateManufacturerAction = createUseCaseAction({
  name: "updateManufacturerAction",
  schema: updateManufacturerInputSchema,
  useCase: updateManufacturer,
  parseFormData: (formData) => ({
    manufacturer_id: formData.get("id"),
    name: formData.has("name") ? formData.get("name") : undefined,
    image_id: formData.has("imageId") ? formData.get("imageId") : undefined,
  }),
  success: (t) => t("Common.successfullySaved"),
});
