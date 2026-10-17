"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { getApplicationContext, toActor } from "@/modules/application";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import {
  createEventPosition as createEventPositionUseCase,
  insertLineupPosition,
  newPositionFieldsSchema,
} from "@sam-monorepo/application";
import { refresh } from "next/cache";
import * as z from "zod";
import { authorizeEventContainer } from "../utils/authorizeEventContainer";
import {
  EVENT_CONTAINER_ID_FIELD,
  EVENT_CONTAINER_KIND_FIELD,
  eventContainerColumns,
  EventContainerKind,
  toTemplateContainer,
} from "../utils/eventContainer";
import { mapLineupErrorToActionResponse } from "../utils/lineupErrorResponse";

/** The lineup editor also adds the positions of an event template */
const schema = newPositionFieldsSchema.extend({
  container_kind: z.enum(EventContainerKind),
  container_id: z.string().min(1).max(64),
});

export const createEventPosition = createAuthenticatedAction(
  "createEventPosition",
  schema,
  async (
    formData,
    authentication,
    { container_kind: containerKind, container_id: containerId, ...fields },
    t,
  ) => {
    const context = getApplicationContext();

    try {
      switch (containerKind) {
        case EventContainerKind.Event:
          await createEventPositionUseCase(
            context,
            await toActor(authentication.session),
            { event_id: containerId, ...fields },
          );
          break;

        case EventContainerKind.Template: {
          const container = toTemplateContainer(containerId);
          const authorization = await authorizeEventContainer(container, t);
          if (!authorization.allowed)
            return { error: authorization.error, requestPayload: formData };

          const createdPosition = await insertLineupPosition(
            context,
            eventContainerColumns(container),
            fields,
          );

          await createAuditEvents([
            {
              type: AuditEventType.EVENT_TEMPLATE_POSITION_CREATED,
              data: { templateId: containerId, ...createdPosition },
              createdById: authentication.session.user.id,
            },
          ]);
          break;
        }

        default:
          throw new Error(
            `Unknown lineup container kind: ${containerKind satisfies never}`,
          );
      }
    } catch (error) {
      return mapLineupErrorToActionResponse(error, formData, t);
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
