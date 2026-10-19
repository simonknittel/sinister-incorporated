import {
  eventContainerColumns,
  EventContainerKind,
  type EventContainer,
  type EventContainerColumns,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { requireEditableEventTemplate } from "../eventTemplates/eventTemplateAccess.js";
import type { ManageableEventOptions } from "../events/eventManageGuard.js";
import { requireManageableEventLineup } from "./lineupGuards.js";

/**
 * The guard of a change of a lineup of an event or of an event template.
 * An event uses the guard of the event lineup (the visibility, the freeze
 * unless `ignoreFreeze`, and the manage rule of the positions). A template
 * uses the rules of the templates: edit access on a template that is not
 * deleted. Templates never freeze.
 *
 * @throws NotFoundError, ConflictError or ForbiddenError
 */
export const requireEditableLineupContainer = async (
  context: ApplicationContext,
  actor: Actor,
  container: EventContainer,
  options: ManageableEventOptions = {},
): Promise<EventContainerColumns> => {
  switch (container.kind) {
    case EventContainerKind.Event:
      await requireManageableEventLineup(context, actor, container.id, options);
      break;

    case EventContainerKind.Template:
      await requireEditableEventTemplate(context, actor, container.id);
      break;

    default:
      throw new Error(
        `Unknown lineup container kind: ${container.kind satisfies never}`,
      );
  }

  return eventContainerColumns(container);
};
