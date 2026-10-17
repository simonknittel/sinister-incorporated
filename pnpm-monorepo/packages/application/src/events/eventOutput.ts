import { EventSource, EventVisibility } from "@sam-monorepo/database/browser";
import type { Citizen } from "@sam-monorepo/database/client";

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

/** A citizen in the output of a use case */
export interface CitizenReference {
  readonly id: string;
  /** Display text. It can change and it does not identify the citizen. */
  readonly handle: string | null;
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

/**
 * A deleted citizen stays hidden, like the UI shows only a "deleted citizen"
 * label for it: the reference is null.
 */
export const toCitizenReference = (
  citizen: Pick<Citizen, "id" | "handle" | "deletedAt"> | null,
): CitizenReference | null =>
  citizen && citizen.deletedAt === null
    ? { id: citizen.id, handle: citizen.handle }
    : null;

/** The citizens that are not deleted, as references */
export const toCitizenReferences = (
  citizens: readonly Pick<Citizen, "id" | "handle" | "deletedAt">[],
): CitizenReference[] =>
  citizens.flatMap((citizen) => toCitizenReference(citizen) ?? []);
