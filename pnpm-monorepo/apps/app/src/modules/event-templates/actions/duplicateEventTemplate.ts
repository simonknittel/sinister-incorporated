"use server";

import { createUseCaseAction } from "@/modules/application";
import {
  duplicateEventTemplateInputSchema,
  duplicateEventTemplate as duplicateEventTemplateUseCase,
} from "@sam-monorepo/application";
import { getEventTemplatePath } from "../utils/eventTemplateConstraints";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const duplicateEventTemplate = createUseCaseAction({
  name: "duplicateEventTemplate",
  schema: duplicateEventTemplateInputSchema,
  useCase: duplicateEventTemplateUseCase,
  parseFormData: (formData) => ({
    source_template_id: formData.get("sourceTemplateId"),
    name: formData.get("name"),
  }),
  texts: EVENT_TEMPLATE_ERROR_TEXTS,
  redirect: (output) => getEventTemplatePath(output.id),
});
