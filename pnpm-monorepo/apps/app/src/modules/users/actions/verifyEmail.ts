"use server";

import { createUseCaseAction } from "@/modules/application";
import { verifyEmail, verifyEmailInputSchema } from "@sam-monorepo/application";

export const verifyEmailAction = createUseCaseAction({
  name: "verifyEmail",
  schema: verifyEmailInputSchema,
  useCase: verifyEmail,
  parseFormData: (formData) => ({
    user_id: formData.get("userId"),
  }),
  success: (t) => t("Common.successfullySaved"),
});
