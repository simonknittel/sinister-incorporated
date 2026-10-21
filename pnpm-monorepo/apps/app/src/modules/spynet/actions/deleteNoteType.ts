"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  deleteNoteTypeInputSchema,
  deleteNoteType as deleteNoteTypeUseCase,
} from "@sam-monorepo/application";

export const deleteNoteType = createUseCaseAction({
  name: "deleteNoteType",
  schema: deleteNoteTypeInputSchema,
  useCase: deleteNoteTypeUseCase,
  parseFormData: (formData) => ({ note_type_id: formData.get("id") }),
  success: (t) => t("Common.successfullyDeleted"),
});
