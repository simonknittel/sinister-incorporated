import { EVENT_NAME_MAX_LENGTH } from "@sam-monorepo/domain";

/**
 * A template's bounds are the event's bounds, so a prefill can never exceed
 * them. The description and the roles have no alias of their own: the event
 * fields and the template use cases hold the one limit for both.
 */
export const EVENT_TEMPLATE_NAME_MAX_LENGTH = EVENT_NAME_MAX_LENGTH;

export const EVENT_TEMPLATES_PATH = "/app/events/templates";

export const getEventTemplatePath = (templateId: string) =>
  `${EVENT_TEMPLATES_PATH}/${templateId}`;
