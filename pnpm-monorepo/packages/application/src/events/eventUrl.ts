import type { ApplicationContext } from "../context.js";

/** The absolute address of the page of an event, like `getEventUrl()` of the app */
export const getEventPageUrl = (
  urls: Pick<ApplicationContext["urls"], "baseUrl">,
  eventId: string,
) => new URL(`/app/events/${eventId}`, urls.baseUrl).toString();
