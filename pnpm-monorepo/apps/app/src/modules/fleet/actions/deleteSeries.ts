"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteSeriesInputSchema,
  deleteSeries as deleteSeriesUseCase,
} from "@sam-monorepo/application";
import { FLEET_DELETE_ERROR_TEXTS } from "../utils/fleetErrorTexts";

export const deleteSeries = createUseCaseAction({
  name: "deleteSeries",
  schema: deleteSeriesInputSchema,
  useCase: deleteSeriesUseCase,
  parseFormData: (formData) => ({ series_id: formData.get("id") }),
  texts: FLEET_DELETE_ERROR_TEXTS,
  success: (t) => t("Common.successfullyDeleted"),
});
