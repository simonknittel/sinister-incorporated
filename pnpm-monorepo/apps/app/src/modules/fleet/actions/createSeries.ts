"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createSeriesInputSchema,
  createSeries as createSeriesUseCase,
} from "@sam-monorepo/application";
import { FLEET_ERROR_TEXTS } from "../utils/fleetErrorTexts";

export const createSeries = createUseCaseAction({
  name: "createSeries",
  schema: createSeriesInputSchema,
  useCase: createSeriesUseCase,
  parseFormData: (formData) => ({
    manufacturer_id: formData.get("manufacturerId"),
    name: formData.get("name"),
  }),
  texts: FLEET_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
