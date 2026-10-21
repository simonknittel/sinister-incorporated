"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteUploadInputSchema,
  deleteUpload as deleteUploadUseCase,
} from "@sam-monorepo/application";

export const deleteUpload = createUseCaseAction({
  name: "deleteUpload",
  schema: deleteUploadInputSchema,
  useCase: deleteUploadUseCase,
  parseFormData: (formData) => ({ upload_id: formData.get("id") }),
  success: (t) => t("Common.successfullyDeleted"),
});
