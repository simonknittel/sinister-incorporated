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
  idSchema,
  lineupOrderSchema,
  reorderEventLineup,
  writeLineupOrder,
  type LineupOrderNode,
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
import { LINEUP_ERROR_TEXTS } from "../utils/lineupErrorTexts";

/** The lineup editor also reorders the lineup of an event template */
const schema = z.object({
  container_kind: z.enum(EventContainerKind),
  container_id: idSchema,
  positions: lineupOrderSchema,
});

/** The tree that the lineup editor sends */
export interface MappedPosition {
  id: string;
  order: number;
  childPositions?: MappedPosition[];
}

/**
 * A position without children has no `children` key: the schema refuses the
 * key on the last level
 */
const toLineupOrder = (positions: MappedPosition[]): LineupOrderNode[] =>
  positions.map((position) => ({
    id: position.id,
    order: position.order,
    ...(position.childPositions?.length
      ? { children: toLineupOrder(position.childPositions) }
      : {}),
  }));

export const updateEventLineupOrder = createAuthenticatedAction(
  "updateEventLineupOrder",
  schema,
  async (
    formData,
    authentication,
    { container_kind: containerKind, container_id: containerId, positions },
    t,
  ) => {
    const context = getApplicationContext();

    try {
      switch (containerKind) {
        case EventContainerKind.Event:
          await reorderEventLineup(
            context,
            await toActor(authentication.session),
            { event_id: containerId, positions },
          );
          break;

        case EventContainerKind.Template: {
          const container = toTemplateContainer(containerId);
          const authorization = await authorizeEventContainer(container, t);
          if (!authorization.allowed)
            return { error: authorization.error, requestPayload: formData };

          await writeLineupOrder(
            context,
            eventContainerColumns(container),
            positions,
          );

          await createAuditEvents([
            {
              type: AuditEventType.EVENT_TEMPLATE_LINEUP_ORDER_CHANGED,
              data: { templateId: containerId },
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
    /**
     * An order that is not valid JSON or that has a different shape throws
     * here, and the action answers with a bad request
     */
    parseFormData: (formData) => ({
      container_kind: formData.get(EVENT_CONTAINER_KIND_FIELD),
      container_id: formData.get(EVENT_CONTAINER_ID_FIELD),
      positions: toLineupOrder(
        JSON.parse(formData.get("order") as string) as MappedPosition[],
      ),
    }),
  },
);
