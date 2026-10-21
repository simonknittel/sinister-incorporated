"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  pasteLineupPosition,
  pasteLineupPositionInputSchema,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const pasteEventPosition = createUseCaseAction({
  name: "pasteEventPosition",
  schema: pasteLineupPositionInputSchema,
  useCase: pasteLineupPosition,
  parseFormData: (formData) => ({
    source_position_id: formData.get("sourcePositionId"),
    target_position_id: formData.get("targetPositionId"),
    placement: formData.get("placement"),
  }),
  texts: EVENT_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
