"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  createLineupPosition,
  createLineupPositionInputSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import {
  EVENT_CONTAINER_ID_FIELD,
  EVENT_CONTAINER_KIND_FIELD,
} from "../utils/eventContainer";
import { LINEUP_ERROR_TEXTS } from "../utils/lineupErrorTexts";

/** The lineup editor also adds the positions of an event template */
export const createEventPosition = createAuthenticatedAction(
  "createEventPosition",
  createLineupPositionInputSchema,
  async (formData, authentication, data, t) => {
    try {
      await createLineupPosition(
        getApplicationContext(),
        await toActor(authentication.session),
        data,
      );
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: LINEUP_ERROR_TEXTS,
      });
    }

    refresh();

    return {
      success: t("Common.successfullySaved"),
    };
  },
  {
    parseFormData: (formData) => ({
      container_kind: formData.get(EVENT_CONTAINER_KIND_FIELD),
      container_id: formData.get(EVENT_CONTAINER_ID_FIELD),
      name: formData.get("name"),
      description: formData.has("description")
        ? formData.get("description")
        : undefined,
      required_variant_ids: formData.getAll("variantId[]"),
      parent_position_id: formData.has("parentPositionId")
        ? formData.get("parentPositionId")
        : undefined,
      font_size: formData.has("fontSize") ? formData.get("fontSize") : null,
      background_color: formData.has("backgroundColor")
        ? formData.get("backgroundColor")
        : null,
      text_color: formData.has("textColor") ? formData.get("textColor") : null,
    }),
  },
);
