import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import type { AuditEventInput } from "@sam-monorepo/domain";
import {
  eventContainerColumns,
  EventContainerKind,
  type EventContainer,
} from "./eventContainer";

/**
 * The system log is immutable, so a lineup mutation on an event keeps writing
 * the exact entry it always wrote and a mutation on a template writes one of
 * the template-scoped types instead. These builders hold that mapping for the
 * actions that are not use cases yet; the use cases of the application
 * package write the event types themselves.
 */

export const buildPositionNameUpdatedAuditEvent = (
  container: EventContainer,
  payload: { positionId: string; previousName: string; newName: string },
  createdById: string,
): AuditEventInput =>
  container.kind === EventContainerKind.Event
    ? {
        type: AuditEventType.EVENT_POSITION_NAME_UPDATED,
        data: { eventId: container.id, ...payload },
        createdById,
      }
    : {
        type: AuditEventType.EVENT_TEMPLATE_POSITION_NAME_UPDATED,
        data: { templateId: container.id, ...payload },
        createdById,
      };

/**
 * A paste between two events writes the entry it always wrote; as soon as a
 * template is involved on either side, the container-shaped type takes over.
 */
export const buildPositionCopiedAuditEvent = (
  source: { container: EventContainer; positionId: string },
  target: { container: EventContainer; positionId: string },
  payload: { placement: "after" | "inside"; positionCount: number },
  createdById: string,
): AuditEventInput => {
  const isEventToEvent =
    source.container.kind === EventContainerKind.Event &&
    target.container.kind === EventContainerKind.Event;

  if (isEventToEvent)
    return {
      type: AuditEventType.EVENT_POSITION_COPIED,
      data: {
        sourceEventId: source.container.id,
        sourcePositionId: source.positionId,
        targetEventId: target.container.id,
        targetPositionId: target.positionId,
        ...payload,
      },
      createdById,
    };

  const sourceIds = eventContainerColumns(source.container);
  const targetIds = eventContainerColumns(target.container);

  return {
    type: AuditEventType.EVENT_TEMPLATE_POSITION_COPIED,
    data: {
      sourceEventId: sourceIds.eventId,
      sourceTemplateId: sourceIds.templateId,
      sourcePositionId: source.positionId,
      targetEventId: targetIds.eventId,
      targetTemplateId: targetIds.templateId,
      targetPositionId: target.positionId,
      ...payload,
    },
    createdById,
  };
};
