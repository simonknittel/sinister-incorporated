import { NotificationChannel } from "@sam-monorepo/database/browser";
import {
  AuditEventType,
  isAllowedWebPushEndpointUrl,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../../context.js";

/**
 * Why the notification router removes web push subscriptions. The values are
 * the reasons of the audit event.
 */
export enum WebPushPruneReason {
  /** A push service answered that the subscription is gone */
  Expired = "expired",
  /**
   * The push service answered the confirmation push of a new subscription
   * that the subscription is gone
   */
  Invalid = "invalid",
}

export interface WebPushSubscriptionTarget {
  readonly id: string;
  readonly endpoint: string;
  readonly keys: { readonly p256dh: string; readonly auth: string };
}

/** One push message: one draft to one subscription of its receiver */
export interface WebPushDelivery<Draft> {
  readonly draft: Draft;
  readonly subscription: WebPushSubscriptionTarget;
}

/**
 * The subscriptions that get the drafts. A draft gets no delivery when its
 * receiver disabled its notification type for web push or has no
 * subscription. A subscription with an endpoint that is not allowed gets no
 * delivery.
 */
export const findWebPushDeliveries = async <
  Draft extends {
    readonly receiverId: string;
    readonly notificationType: string;
  },
>(
  context: ApplicationContext,
  drafts: readonly Draft[],
): Promise<WebPushDelivery<Draft>[]> => {
  const citizens = await context.prisma.citizen.findMany({
    where: {
      id: {
        in: drafts.map((draft) => draft.receiverId),
      },
    },
    select: {
      id: true,
      notificationSettings: {
        where: {
          channel: NotificationChannel.WEB_PUSH,
        },
        select: {
          notificationType: true,
        },
      },
      // The Prisma client leaves out the keys of a subscription by default,
      // thus the delivery selects them explicitly
      webPushSubscriptions: {
        select: {
          id: true,
          endpoint: true,
          p256dh: true,
          auth: true,
        },
      },
    },
  });
  const citizensById = new Map(
    citizens.map((citizen) => [citizen.id, citizen]),
  );

  return drafts.flatMap((draft) => {
    const citizen = citizensById.get(draft.receiverId);
    if (!citizen) return [];

    // Opt-out model: a NotificationSetting row means the citizen disabled
    // this notification type for web push.
    const disabledSetting = citizen.notificationSettings.find(
      (setting) => setting.notificationType === draft.notificationType,
    );
    if (disabledSetting) return [];

    return citizen.webPushSubscriptions
      .filter((subscription) =>
        isAllowedWebPushEndpointUrl(subscription.endpoint),
      )
      .map((subscription) => ({
        draft,
        subscription: {
          id: subscription.id,
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
      }));
  });
};

export interface FindWebPushSubscriptionInput {
  readonly subscriptionId: string;
}

/** The subscription with its keys, or null when it does not exist */
export const findWebPushSubscription = async (
  context: ApplicationContext,
  input: FindWebPushSubscriptionInput,
): Promise<
  (WebPushSubscriptionTarget & { readonly citizenId: string }) | null
> => {
  const subscription = await context.prisma.webPushSubscription.findUnique({
    where: {
      id: input.subscriptionId,
    },
    select: {
      id: true,
      citizenId: true,
      endpoint: true,
      p256dh: true,
      auth: true,
    },
  });
  if (!subscription) return null;

  return {
    id: subscription.id,
    citizenId: subscription.citizenId,
    endpoint: subscription.endpoint,
    keys: { p256dh: subscription.p256dh, auth: subscription.auth },
  };
};

export interface PruneWebPushSubscriptionsInput {
  readonly subscriptionIds: readonly string[];
  readonly reason: WebPushPruneReason;
}

/**
 * Deletes the subscriptions, and writes the audit event with the number of
 * deleted rows (also 0, when the rows were gone)
 */
export const pruneWebPushSubscriptions = async (
  context: ApplicationContext,
  input: PruneWebPushSubscriptionsInput,
): Promise<{ readonly count: number }> => {
  const { count } = await context.prisma.webPushSubscription.deleteMany({
    where: { id: { in: [...input.subscriptionIds] } },
  });

  await context.audit.create([
    {
      type: AuditEventType.WEB_PUSH_SUBSCRIPTIONS_PRUNED,
      data: { count, reason: input.reason },
      createdById: null,
    },
  ]);

  return { count };
};
