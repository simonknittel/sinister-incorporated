import {
  findEventBriefingPublishedRecipients,
  type ApplicationContext,
} from "@sam-monorepo/application";
import { type Event } from "@sam-monorepo/database";
import { publishNotifications } from "../publish.js";

type Payload = {
  eventId: Event["id"];
  /** Snapshot of the root page's new read scope at publish time */
  readScope: "PARTICIPANTS" | "POSITION" | "ALL";
  readScopePositionId: string | null;
};

/**
 * Fired once per event when the briefing's read scope first leaves the
 * managers. Recipients are exactly the audience of the new scope, so
 * nobody hears about a briefing they can't open.
 */
export const EventBriefingPublishedHandler = async (
  context: ApplicationContext,
  payload: Payload,
) => {
  const result = await findEventBriefingPublishedRecipients(context, {
    eventId: payload.eventId,
    readScope: payload.readScope,
    readScopePositionId: payload.readScopePositionId,
  });
  if (!result) return;

  await publishNotifications(
    context,
    result.recipients.map((recipient) => ({
      receiverId: recipient.citizenId,
      notificationType: "event_briefing_published" as const,
      payload: {
        eventId: result.event.id,
        eventName: result.event.name,
      },
      title: "Briefing veröffentlicht",
      body: result.event.name,
      url: `/app/events/${result.event.id}/briefing`,
    })),
  );
};
