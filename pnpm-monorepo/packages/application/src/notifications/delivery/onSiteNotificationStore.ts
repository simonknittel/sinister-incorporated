import type { Prisma } from "@sam-monorepo/database/client";
import {
  ACTIVE_CITIZEN_WHERE,
  AuditEventType,
  ON_SITE_NOTIFICATION_PAYLOAD_VERSIONS,
  type ParsedOnSiteNotificationPayload,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../../context.js";

/** One on-site notification for one receiver, before the store writes it */
export type OnSiteNotificationDraft = {
  readonly receiverId: string;
} & ParsedOnSiteNotificationPayload;

/** A written on-site notification, with the fields of the realtime event */
export interface StoredOnSiteNotification {
  readonly id: string;
  readonly citizenId: string;
  readonly notificationType: string;
  readonly payload: Prisma.JsonValue;
  readonly payloadVersion: number;
  readonly createdAt: Date;
}

export interface StoreOnSiteNotificationsOutput {
  readonly rows: StoredOnSiteNotification[];
  /**
   * The receivers that are not deleted. The other channels send only to
   * these receivers.
   */
  readonly activeReceiverIds: ReadonlySet<string>;
}

/**
 * Writes one on-site notification for each draft of an active receiver. A
 * deleted citizen gets no notification on any channel. This is the only
 * filter for this rule, thus the recipient rules and the channels do not
 * filter deleted receivers again. On-site is always on, thus the settings of
 * the citizen do not filter the rows (they filter only web push).
 */
export const storeOnSiteNotifications = async (
  context: ApplicationContext,
  drafts: readonly OnSiteNotificationDraft[],
): Promise<StoreOnSiteNotificationsOutput> => {
  if (drafts.length <= 0) return { rows: [], activeReceiverIds: new Set() };

  const activeReceivers = await context.prisma.citizen.findMany({
    where: {
      id: {
        in: [...new Set(drafts.map((draft) => draft.receiverId))],
      },
      ...ACTIVE_CITIZEN_WHERE,
    },
    select: { id: true },
  });
  const activeReceiverIds = new Set(
    activeReceivers.map((receiver) => receiver.id),
  );

  const activeDrafts = drafts.filter((draft) =>
    activeReceiverIds.has(draft.receiverId),
  );
  if (activeDrafts.length <= 0) return { rows: [], activeReceiverIds };

  const rows = await context.prisma.onSiteNotification.createManyAndReturn({
    data: activeDrafts.map((draft) => ({
      citizenId: draft.receiverId,
      notificationType: draft.notificationType,
      payload: draft.payload,
      payloadVersion:
        ON_SITE_NOTIFICATION_PAYLOAD_VERSIONS[draft.notificationType],
    })),
    select: {
      id: true,
      citizenId: true,
      notificationType: true,
      payload: true,
      payloadVersion: true,
      createdAt: true,
    },
  });

  context.log.info("Created on-site notifications", { count: rows.length });

  await context.audit.create([
    {
      type: AuditEventType.ON_SITE_NOTIFICATIONS_CREATED,
      data: {
        count: rows.length,
        notificationTypes: [
          ...new Set(rows.map((row) => row.notificationType)),
        ],
      },
      createdById: null,
    },
  ]);

  return { rows, activeReceiverIds };
};
