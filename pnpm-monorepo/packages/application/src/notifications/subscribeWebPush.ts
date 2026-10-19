import {
  AuditEventType,
  isAllowedWebPushEndpointUrl,
} from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";

/**
 * The endpoints of the push services are much shorter. The limit bounds the
 * input.
 */
const MAXIMUM_WEB_PUSH_ENDPOINT_LENGTH = 2048;

/**
 * The keys are Base64url text: `p256dh` has 87 characters and `auth` 22. The
 * limit bounds the input.
 */
const MAXIMUM_WEB_PUSH_KEY_LENGTH = 512;

export const subscribeWebPushInputSchema = z.object({
  subscription: z.object({
    endpoint: z
      .string()
      .max(MAXIMUM_WEB_PUSH_ENDPOINT_LENGTH)
      .refine(isAllowedWebPushEndpointUrl),
    keys: z.object({
      p256dh: z.string().max(MAXIMUM_WEB_PUSH_KEY_LENGTH),
      auth: z.string().max(MAXIMUM_WEB_PUSH_KEY_LENGTH),
    }),
  }),
});

export type SubscribeWebPushInput = z.output<
  typeof subscribeWebPushInputSchema
>;

export interface SubscribeWebPushOutput {
  readonly subscription_id: string;
  readonly notifications_sent: boolean;
}

/**
 * Saves the web push subscription of a browser for the citizen of the actor.
 * The endpoint identifies the subscription: a second save of the same
 * endpoint changes only its keys. A test notification confirms the
 * subscription on the device.
 *
 * @throws ForbiddenError for a user without a citizen
 */
export const subscribeWebPush = (
  context: ApplicationContext,
  actor: Actor,
  input: SubscribeWebPushInput,
): Promise<SubscribeWebPushOutput> =>
  withSpan(context, "subscribeWebPush", async () => {
    const citizenId = requireCitizen(actor).id;

    const subscription = await context.prisma.webPushSubscription.upsert({
      where: {
        endpoint: input.subscription.endpoint,
      },
      update: {
        p256dh: input.subscription.keys.p256dh,
        auth: input.subscription.keys.auth,
      },
      create: {
        citizenId,
        endpoint: input.subscription.endpoint,
        p256dh: input.subscription.keys.p256dh,
        auth: input.subscription.keys.auth,
      },
      select: {
        id: true,
        citizenId: true,
      },
    });

    await context.audit.create([
      {
        type: AuditEventType.WEB_PUSH_SUBSCRIBED,
        data: {
          subscriptionId: subscription.id,
          citizenId: subscription.citizenId,
        },
        createdById: actor.userId,
      },
    ]);

    /**
     * The test notification only confirms the subscription, which is saved
     * already. A failure must not make the user subscribe again: each new
     * subscription of the browser gets a new endpoint.
     */
    const notificationsSent = await triggerNotificationsAfterSave(context, [
      {
        type: "WebPushSubscribed",
        payload: {
          subscriptionId: subscription.id,
        },
      },
    ]);

    return {
      subscription_id: subscription.id,
      notifications_sent: notificationsSent,
    };
  });
