"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  createNoteTypeInputSchema,
  createNoteType as createNoteTypeUseCase,
} from "@sam-monorepo/application";

export const createNoteType = createUseCaseAction({
  name: "createNoteType",
  schema: createNoteTypeInputSchema,
  useCase: createNoteTypeUseCase,
  success: () => "Erfolgreich hinzugefügt",
});
