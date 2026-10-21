"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  withdrawEventPositionApplication,
  withdrawEventPositionApplicationInputSchema,
} from "@sam-monorepo/application";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

export const deleteEventPositionApplicationForCurrentUser = createUseCaseAction(
  {
    name: "deleteEventPositionApplicationForCurrentUser",
    schema: withdrawEventPositionApplicationInputSchema,
    useCase: withdrawEventPositionApplication,
    parseFormData: (formData) => ({
      position_id: formData.get("positionId"),
    }),
    texts: EVENT_ERROR_TEXTS,
    success: (t) => t("Common.successfullySaved"),
  },
);
