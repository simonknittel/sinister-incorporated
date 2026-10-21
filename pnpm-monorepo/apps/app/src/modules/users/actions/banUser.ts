"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  banUserInputSchema,
  banUser as banUserUseCase,
} from "@sam-monorepo/application";
import { USER_ERROR_TEXTS } from "../utils/userErrorTexts";

export const banUserAction = createUseCaseAction({
  name: "banUser",
  schema: banUserInputSchema,
  useCase: banUserUseCase,
  parseFormData: (formData) => ({
    user_id: formData.get("userId"),
    reason: formData.get("reason") ?? undefined,
  }),
  texts: USER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
