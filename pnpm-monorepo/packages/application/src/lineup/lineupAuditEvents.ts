import {
  AuditEventType,
  eventContainerColumns,
  EventContainerKind,
  type AuditEventInput,
  type EventContainer,
} from "@sam-monorepo/domain";
import type { PastePlacement } from "./pasteLineupPosition.js";

/*
 * The system log is immutable, thus a change of the lineup of an event
 * writes the entry that it always wrote, and a change of the lineup of a
 * template writes one of the template types.
 */

export const buildPositionNameUpdatedAuditEvent = (
  container: EventContainer,
  payload: { positionId: string; previousName: string; newName: string },
  createdById: string,
): AuditEventInput => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return {
        type: AuditEventType.EVENT_POSITION_NAME_UPDATED,
        data: { eventId: container.id, ...payload },
        createdById,
      };

    case EventContainerKind.Template:
      return {
        type: AuditEventType.EVENT_TEMPLATE_POSITION_NAME_UPDATED,
        data: { templateId: container.id, ...payload },
        createdById,
      };

    default:
      throw new Error(
        `Unknown lineup container kind: ${container.kind satisfies never}`,
      );
  }
};

interface CopiedPosition {
  readonly container: EventContainer;
  readonly positionId: string;
}

/**
 * A paste between two events writes the entry that it always wrote. When a
 * template is the source or the target, the template type is written.
 */
export const buildPositionCopiedAuditEvent = (
  source: CopiedPosition,
  target: CopiedPosition,
  payload: { placement: PastePlacement; positionCount: number },
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

  const sourceColumns = eventContainerColumns(source.container);
  const targetColumns = eventContainerColumns(target.container);

  return {
    type: AuditEventType.EVENT_TEMPLATE_POSITION_COPIED,
    data: {
      sourceEventId: sourceColumns.eventId,
      sourceTemplateId: sourceColumns.templateId,
      sourcePositionId: source.positionId,
      targetEventId: targetColumns.eventId,
      targetTemplateId: targetColumns.templateId,
      targetPositionId: target.positionId,
      ...payload,
    },
    createdById,
  };
};
