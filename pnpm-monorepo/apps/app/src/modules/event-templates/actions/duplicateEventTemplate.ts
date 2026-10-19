"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  duplicateEventTemplateInputSchema,
  duplicateEventTemplate as duplicateEventTemplateUseCase,
  type DuplicateEventTemplateOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getEventTemplatePath } from "../utils/eventTemplateConstraints";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

export const duplicateEventTemplate = createAuthenticatedAction(
  "duplicateEventTemplate",
  duplicateEventTemplateInputSchema,
  async (formData, authentication, data, t) => {
    let result: DuplicateEventTemplateOutput;
    try {
      result = await duplicateEventTemplateUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: EVENT_TEMPLATE_ERROR_TEXTS,
      });
    }

    refresh();

    redirect(getEventTemplatePath(result.id));
  },
  {
    parseFormData: (formData) => ({
      source_template_id: formData.get("sourceTemplateId"),
      name: formData.get("name"),
    }),
  },
);
