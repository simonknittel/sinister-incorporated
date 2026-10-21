"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  unbanUserInputSchema,
  unbanUser as unbanUserUseCase,
} from "@sam-monorepo/application";
import { USER_ERROR_TEXTS } from "../utils/userErrorTexts";

export const unbanUserAction = createUseCaseAction({
  name: "unbanUser",
  schema: unbanUserInputSchema,
  useCase: unbanUserUseCase,
  parseFormData: (formData) => ({ user_id: formData.get("userId") }),
  texts: USER_ERROR_TEXTS,
  success: (t) => t("Common.successfullySaved"),
});
