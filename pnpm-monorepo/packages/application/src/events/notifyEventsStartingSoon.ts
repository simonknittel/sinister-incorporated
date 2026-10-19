import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";

/**
 * The interval of the schedule of `frequent-automations`: thus each run
 * notifies the events that start before the next run.
 */
const NOTIFICATION_MINUTES_BEFORE = 15;

const MILLISECONDS_PER_MINUTE = 60 * 1000;

export interface NotifyEventsStartingSoonOutput {
  /** The events (from the app and from Discord) that start soon */
  readonly eventCount: number;
  readonly notificationsSent: boolean;
}

/** Requests the `EventStarting` notification of each event that starts soon */
export const notifyEventsStartingSoon = (
  context: ApplicationContext,
): Promise<NotifyEventsStartingSoonOutput> =>
  withSpan(context, "notifyEventsStartingSoon", async () => {
    const now = context.now();
    const events = await context.prisma.event.findMany({
      where: {
        startTime: {
          gte: now,
          lte: new Date(
            now.getTime() +
              NOTIFICATION_MINUTES_BEFORE * MILLISECONDS_PER_MINUTE,
          ),
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    if (events.length <= 0) return { eventCount: 0, notificationsSent: true };

    const notificationsSent = await triggerNotificationsAfterSave(
      context,
      events.map((event) => ({
        type: "EventStarting",
        payload: { eventId: event.id },
      })),
    );

    return { eventCount: events.length, notificationsSent };
  });
