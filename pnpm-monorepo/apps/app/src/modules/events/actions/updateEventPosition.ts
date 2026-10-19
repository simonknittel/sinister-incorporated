"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  updateEventPositionInputSchema,
  updateLineupPosition,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { EVENT_ERROR_TEXTS } from "../utils/eventErrorTexts";

/** The lineup editor also changes the positions of an event template */
export const updateEventPosition = createAuthenticatedAction(
  "updateEventPosition",
  updateEventPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await updateLineupPosition(
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

    return {
      success: "Erfolgreich gespeichert.",
    };
  },
  {
    parseFormData: (formData) => ({
      position_id: formData.get("positionId"),
      name: formData.get("name"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      required_variant_ids: formData.getAll("variantId[]"),
      font_size: formData.has("fontSize") ? formData.get("fontSize") : null,
      background_color: formData.has("backgroundColor")
        ? formData.get("backgroundColor")
        : null,
      text_color: formData.has("textColor") ? formData.get("textColor") : null,
    }),
  },
);
