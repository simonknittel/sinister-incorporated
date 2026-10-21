"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  renameLineupPosition,
  renameLineupPositionInputSchema,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const updateEventPositionName = createUseCaseAction({
  name: "updateEventPositionName",
  schema: renameLineupPositionInputSchema,
  useCase: renameLineupPosition,
  parseFormData: (formData) => ({
    position_id: formData.get("id"),
    name: formData.get("name"),
  }),
  texts: EVENT_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
