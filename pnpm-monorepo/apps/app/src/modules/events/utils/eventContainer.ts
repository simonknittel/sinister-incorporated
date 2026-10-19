import { EventContainerKind, type EventContainer } from "@sam-monorepo/domain";

export {
  eventContainerColumns,
  EventContainerKind,
  toEventContainer,
  toTemplateContainer,
  wikiContainerColumns,
  type EventContainer,
} from "@sam-monorepo/domain";

/** Where the container's briefing is rendered */
export const getBriefingPath = (container: EventContainer) => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return `/app/events/${container.id}/briefing`;

    case EventContainerKind.Template:
      return `/app/events/templates/${container.id}/briefing`;

    default:
      throw new Error(
        `Unknown event container kind: ${container.kind satisfies never}`,
      );
  }
};

/** Where the container's lineup is rendered */
export const getLineupPath = (container: EventContainer) => {
  switch (container.kind) {
    case EventContainerKind.Event:
      return `/app/events/${container.id}/lineup`;

    case EventContainerKind.Template:
      return `/app/events/templates/${container.id}/lineup`;

    default:
      throw new Error(
        `Unknown lineup container kind: ${container.kind satisfies never}`,
      );
  }
};

/** The form fields the client sends to name a container */
export const EVENT_CONTAINER_KIND_FIELD = "containerKind";
export const EVENT_CONTAINER_ID_FIELD = "containerId";

export const eventContainerFormValues = (container: EventContainer) => ({
  [EVENT_CONTAINER_KIND_FIELD]: container.kind,
  [EVENT_CONTAINER_ID_FIELD]: container.id,
});
