import {
  EventContainerKind,
  type EventContainer,
} from "../events/eventContainer.js";

/**
 * The routes of the wiki in the Next.js app, relative to its base URL. The
 * application and the client components of the app build their hrefs on
 * them.
 */
export const GLOBAL_WIKI_BASE_PATH = "/app/wiki";

/** Where the briefing of an event or of an event template is rendered */
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

/** The page of a fleet variant: it renders the root page of the variant wiki */
export const getVariantWikiRootPath = (variantId: string) =>
  `/app/fleet/variant/${variantId}`;

/** The route below which the subpages of the variant wiki live */
export const getVariantWikiBasePath = (variantId: string) =>
  `${getVariantWikiRootPath(variantId)}/wiki`;
