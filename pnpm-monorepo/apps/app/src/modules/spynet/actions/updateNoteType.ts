"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  updateNoteTypeInputSchema,
  updateNoteType as updateNoteTypeUseCase,
} from "@sam-monorepo/application";

export const updateNoteType = createUseCaseAction({
  name: "updateNoteType",
  schema: updateNoteTypeInputSchema,
  useCase: updateNoteTypeUseCase,
  parseFormData: (formData) => ({
    note_type_id: formData.get("id"),
    name: formData.get("name"),
  }),
  success: () => "Erfolgreich bearbeitet",
});
