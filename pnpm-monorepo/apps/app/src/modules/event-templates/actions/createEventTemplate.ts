"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { probeUploadImageDimensions } from "@/modules/common/utils/probeUploadImageDimensions";
import { EVENT_ERROR_TEXTS } from "@/modules/events/utils/eventErrorTexts";
import {
  createEventTemplateInputSchema,
  createEventTemplate as createEventTemplateUseCase,
  idSchema,
  type CreateEventTemplateOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getEventTemplatePath } from "../utils/eventTemplateConstraints";
import { EVENT_TEMPLATE_ERROR_TEXTS } from "../utils/eventTemplateErrorTexts";

/** The use case also throws the event errors of the description and the cover image */
const ERROR_TEXTS = { ...EVENT_ERROR_TEXTS, ...EVENT_TEMPLATE_ERROR_TEXTS };

/** The use case takes the details. The cover image is only in the app. */
const schema = createEventTemplateInputSchema.extend({
  coverImageId: idSchema.optional(),
});

export const createEventTemplate = createAuthenticatedAction(
  "createEventTemplate",
  schema,
  async (formData, authentication, { coverImageId, ...input }, t) => {
    let result: CreateEventTemplateOutput;
    try {
      result = await createEventTemplateUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        input,
        { coverImageId },
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: ERROR_TEXTS,
      });
    }

    refresh();

    if (coverImageId) probeUploadImageDimensions(coverImageId);

    /**
     * Redirect to the new template, where lineup, briefing and prefill are
     * edited; the form's success hook closes the modal while the navigation
     * is in flight (see useAction).
     */
    redirect(getEventTemplatePath(result.id));
  },
  {
    parseFormData: (formData) => ({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      coverImageId: formData.get("coverImageId") || undefined,
    }),
  },
);
