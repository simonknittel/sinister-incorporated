import type { EventPosition } from "@sam-monorepo/database/client";

/**
 * A lineup and a briefing hang off either a real event or an event template
 * blueprint of one. Both store their positions and wiki pages in the same
 * tables (see EventPosition.eventId and WikiPage.templateId), so one editor
 * and one set of server actions serve both — the container is what decides
 * who may edit it and where the audit entry points.
 */
export enum EventContainerKind {
  Event = "event",
  Template = "template",
}

export interface EventContainer {
  readonly kind: EventContainerKind;
  readonly id: string;
}

/**
 * The container columns of a position row: an event or an event template.
 * Exactly one of the two columns is set (a CHECK constraint of the database).
 */
export type EventContainerColumns =
  | { readonly eventId: string; readonly templateId: null }
  | { readonly eventId: null; readonly templateId: string };

export const toEventContainer = (eventId: string): EventContainer => ({
  kind: EventContainerKind.Event,
  id: eventId,
});

export const toTemplateContainer = (templateId: string): EventContainer => ({
  kind: EventContainerKind.Template,
  id: templateId,
});

/**
 * The container a stored position belongs to. Returns null for a row with
 * neither column set, which the CHECK constraint rules out — callers treat
 * it like a missing position.
 */
export const getPositionContainer = (
  position: Pick<EventPosition, "eventId" | "templateId">,
): EventContainer | null => {
  if (position.eventId) return toEventContainer(position.eventId);
  if (position.templateId) return toTemplateContainer(position.templateId);
  return null;
};

/**
 * The container columns of a position row — usable both as a `where` filter
 * that can never match the other container and as `create` data.
 */
export const eventContainerColumns = (
  container: EventContainer,
): EventContainerColumns => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return { eventId: container.id, templateId: null };

    case EventContainerKind.Template:
      return { eventId: null, templateId: container.id };

    default:
      throw new Error(
        `Unknown lineup container kind: ${container.kind satisfies never}`,
      );
  }
};

/**
 * The container columns of a wiki page or tag, where "no container" is a
 * valid state: the global wiki.
 */
export const wikiContainerColumns = (container: EventContainer | null) =>
  container
    ? eventContainerColumns(container)
    : { eventId: null, templateId: null };

/**
 * The container a stored wiki page or tag belongs to. Both columns are NULL
 * for the global wiki, where the caller falls back to the global paths.
 */
export const getWikiPageContainer = (page: {
  readonly eventId: string | null;
  readonly templateId: string | null;
}): EventContainer | null => {
  if (page.eventId) return toEventContainer(page.eventId);
  if (page.templateId) return toTemplateContainer(page.templateId);
  return null;
};
