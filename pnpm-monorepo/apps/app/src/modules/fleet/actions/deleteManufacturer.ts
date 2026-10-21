"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteManufacturerInputSchema,
  deleteManufacturer as deleteManufacturerUseCase,
} from "@sam-monorepo/application";
import { FLEET_DELETE_ERROR_TEXTS } from "../utils/fleetErrorTexts";

export const deleteManufacturer = createUseCaseAction({
  name: "deleteManufacturer",
  schema: deleteManufacturerInputSchema,
  useCase: deleteManufacturerUseCase,
  parseFormData: (formData) => ({ manufacturer_id: formData.get("id") }),
  texts: FLEET_DELETE_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
