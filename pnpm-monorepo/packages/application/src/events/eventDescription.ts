import { getEventDescriptionMaxLength } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { EventErrorMessage } from "./eventErrors.js";

/** The absolute address of the page of an event, like `getEventUrl()` of the app */
const getEventUrl = (
  context: Pick<ApplicationContext, "urls">,
  eventId: string,
) => new URL(`/app/events/${eventId}`, context.urls.baseUrl).toString();

/**
 * The description and the sign-up note that the app adds to the Discord
 * event must fit into the cap of Discord (see
 * `getEventDescriptionMaxLength()`). Also for an event that is not
 * published: a later publication needs it.
 *
 * @throws ValidationError when the description is too long
 */
export const requireDescriptionFitsDiscord = (
  context: Pick<ApplicationContext, "urls">,
  description: string | null | undefined,
) => {
  const maxLength = getEventDescriptionMaxLength((eventId) =>
    getEventUrl(context, eventId),
  );
  if (description && description.length > maxLength)
    throw new ValidationError(EventErrorMessage.DescriptionTooLong);
};
