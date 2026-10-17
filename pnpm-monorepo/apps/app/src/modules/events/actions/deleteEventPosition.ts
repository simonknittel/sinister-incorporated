"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import {
  deleteEventPositionInputSchema,
  deleteEventPosition as deleteEventPositionUseCase,
  deleteLineupPosition,
  findLineupPositionContainer,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import { mapLineupErrorToActionResponse } from "../utils/lineupErrorResponse";
import { requireManageablePosition } from "../utils/requireManageablePosition";

export const deleteEventPosition = createAuthenticatedAction(
  "deleteEventPosition",
  deleteEventPositionInputSchema,
  async (formData, authentication, data, t) => {
    const context = getApplicationContext();

    try {
      const container = await findLineupPositionContainer(
        context,
        data.position_id,
      );

      if (container.eventId !== null) {
        await deleteEventPositionUseCase(
          context,
          await toActor(authentication.session),
          data,
        );
      } else {
        /** The lineup editor also deletes the positions of an event template */
        const { position, failure } = await requireManageablePosition(
          data.position_id,
          formData,
          t,
        );
        if (failure) return failure;

        await deleteLineupPosition(context, position.id);

        await createAuditEvents([
          {
            type: AuditEventType.EVENT_TEMPLATE_POSITION_DELETED,
            data: {
              templateId: container.templateId,
              positionId: position.id,
              name: position.name,
            },
            createdById: authentication.session.user.id,
          },
        ]);
      }
    } catch (error) {
      return mapLineupErrorToActionResponse(error, formData, t);
    }

    refresh();

    return {
      success: t("Common.successfullyDeleted"),
    };
  },
  {
    parseFormData: (formData) => ({ position_id: formData.get("id") }),
  },
);
