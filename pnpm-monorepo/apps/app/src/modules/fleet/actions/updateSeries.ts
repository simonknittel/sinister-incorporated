"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateSeriesInputSchema,
  updateSeries as updateSeriesUseCase,
} from "@sam-monorepo/application";

export const updateSeries = createUseCaseAction({
  name: "updateSeries",
  schema: updateSeriesInputSchema,
  useCase: updateSeriesUseCase,
  parseFormData: (formData) => ({
    series_id: formData.get("id"),
    name: formData.get("name"),
  }),
  success: (t) => t("Common.successfullySaved"),
});
