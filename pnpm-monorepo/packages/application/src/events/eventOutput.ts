import { EventSource, EventVisibility } from "@sam-monorepo/database/browser";

/** Where an event comes from */
export enum EventSourceType {
  /** Created and managed in the app */
  App = "app",
  /** Mirrored from Discord. Its core data is read-only in the app. */
  Discord = "discord",
}

export enum EventVisibilityType {
  /** Visible to everyone with `event;read` */
  Public = "public",
  /**
   * Visible only to the holders of the selected roles, the creator, the
   * managers and `event;manage`
   */
  Restricted = "restricted",
}

export const toEventSourceType = (source: EventSource): EventSourceType => {
  switch (source) {
    case EventSource.APP:
      return EventSourceType.App;

    case EventSource.DISCORD:
      return EventSourceType.Discord;

    default:
      throw new Error(`Unknown event source: ${source satisfies never}`);
  }
};

export const toEventVisibilityType = (
  visibility: EventVisibility,
): EventVisibilityType => {
  switch (visibility) {
    case EventVisibility.PUBLIC:
      return EventVisibilityType.Public;

    case EventVisibility.RESTRICTED:
      return EventVisibilityType.Restricted;

    default:
      throw new Error(
        `Unknown event visibility: ${visibility satisfies never}`,
      );
  }
};
