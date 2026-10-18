"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import {
  findLineupPositionContainer,
  updateEventPositionInputSchema,
  updateEventPosition as updateEventPositionUseCase,
  updateLineupPosition,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { LINEUP_ERROR_TEXTS } from "../utils/eventErrorTexts";
import { requireManageablePosition } from "../utils/requireManageablePosition";

export const updateEventPosition = createAuthenticatedAction(
  "updateEventPosition",
  updateEventPositionInputSchema,
  async (formData, authentication, data, t) => {
    const context = getApplicationContext();

    try {
      const container = await findLineupPositionContainer(
        context,
        data.position_id,
      );

      if (container.eventId !== null) {
        await updateEventPositionUseCase(
          context,
          await toActor(authentication.session),
          data,
        );
      } else {
        /** The lineup editor also changes the positions of an event template */
        const { position, failure } = await requireManageablePosition(
          data.position_id,
          formData,
          t,
        );
        if (failure) return failure;

        const updatedPosition = await updateLineupPosition(
          context,
          position,
          data,
        );

        await createAuditEvents([
          {
            type: AuditEventType.EVENT_TEMPLATE_POSITION_UPDATED,
            data: { templateId: container.templateId, ...updatedPosition },
            createdById: authentication.session.user.id,
          },
        ]);
      }
    } catch (error) {
      return mapApplicationErrorToActionResponse(error, {
        formData,
        t,
        texts: LINEUP_ERROR_TEXTS,
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
