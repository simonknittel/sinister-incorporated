"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  revokeOwnGrant,
  revokeOwnGrantInputSchema,
} from "@sam-monorepo/application";

export const revokeOAuthGrant = createUseCaseAction({
  name: "revokeOAuthGrant",
  schema: revokeOwnGrantInputSchema,
  useCase: revokeOwnGrant,
  parseFormData: (formData) => ({ grant_id: formData.get("grantId") }),
  success: (t) => t("Common.successfullyDeleted"),
});
