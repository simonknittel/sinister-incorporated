import { getApplicationContext, getRequestActor } from "@/modules/application";
import { getEventTemplateById } from "@/modules/event-templates/queries/getEventTemplateById";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  requireManageableEventLineup,
  type ManageableEventLineupOptions,
} from "@sam-monorepo/application";
import type { getTranslations } from "next-intl/server";
import { refresh } from "next/cache";
import { EventContainerKind, type EventContainer } from "./eventContainer";
import { toLineupErrorText } from "./lineupErrorResponse";

export type EventContainerAuthorization =
  | { readonly allowed: true; readonly error?: never }
  | { readonly allowed: false; readonly error: string };

/**
 * The failure of a container that is gone or over, for example because a
 * different tab deleted it. The refresh shows that state on the page.
 */
const rejectContainerConflict = (
  error: string,
): EventContainerAuthorization => {
  refresh();

  return { allowed: false, error };
};

/**
 * The single authorization seam of the lineup mutations of the app. Events
 * use the guard of the application package (`requireManageableEventLineup`).
 * Templates use their own ACL instead: edit access on a template that is not
 * soft-deleted. Templates never freeze, because they have no schedule to be
 * over. Call it only in a server action (see `rejectContainerConflict`).
 */
export const authorizeEventContainer = async (
  container: EventContainer,
  t: Awaited<ReturnType<typeof getTranslations>>,
  options: ManageableEventLineupOptions = {},
): Promise<EventContainerAuthorization> => {
  switch (container.kind) {
    case EventContainerKind.Event:
      try {
        await requireManageableEventLineup(
          getApplicationContext(),
          await getRequestActor(),
          container.id,
          options,
        );
      } catch (error) {
        if (error instanceof ForbiddenError)
          return { allowed: false, error: t("Common.forbidden") };
        if (error instanceof NotFoundError || error instanceof ConflictError)
          return rejectContainerConflict(toLineupErrorText(error));
        throw error;
      }

      return { allowed: true };

    case EventContainerKind.Template: {
      const context = await getEventTemplateById(container.id);
      if (!context) return rejectContainerConflict("Vorlage nicht gefunden");
      if (context.template.deletedAt !== null)
        return rejectContainerConflict("Die Vorlage ist gelöscht.");
      if (!context.permissions.canEdit)
        return { allowed: false, error: t("Common.forbidden") };

      return { allowed: true };
    }

    default:
      throw new Error(
        `Unknown lineup container kind: ${container.kind satisfies never}`,
      );
  }
};
