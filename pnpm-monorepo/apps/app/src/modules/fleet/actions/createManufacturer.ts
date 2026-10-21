"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createManufacturerInputSchema,
  createManufacturer as createManufacturerUseCase,
} from "@sam-monorepo/application";
import { FLEET_ERROR_TEXTS } from "../utils/fleetErrorTexts";

export const createManufacturer = createUseCaseAction({
  name: "createManufacturer",
  schema: createManufacturerInputSchema,
  useCase: createManufacturerUseCase,
  texts: FLEET_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
