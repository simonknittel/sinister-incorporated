"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { EVENT_ERROR_TEXTS } from "@/modules/events/utils/eventErrorTexts";
import {
  createEventTemplateFromEventInputSchema,
  createEventTemplateFromEvent as createEventTemplateFromEventUseCase,
  type CreateEventTemplateFromEventOutput,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getEventTemplatePath } from "../utils/eventTemplateConstraints";

export const createEventTemplateFromEvent = createAuthenticatedAction(
  "createEventTemplateFromEvent",
  createEventTemplateFromEventInputSchema,
  async (formData, authentication, data, t) => {
    let result: CreateEventTemplateFromEventOutput;
    try {
      result = await createEventTemplateFromEventUseCase(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: EVENT_ERROR_TEXTS,
      });
    }

    refresh();

    redirect(getEventTemplatePath(result.id));
  },
  {
    parseFormData: (formData) => ({
      source_event_id: formData.get("sourceEventId"),
      name: formData.get("name"),
    }),
  },
);
