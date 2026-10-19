import { WikiPageNamespace, type Prisma } from "@sam-monorepo/database/client";
import {
  AuditEventType,
  collectPositionScopeIdsForCitizen,
  comparePermissionSets,
  createEventWikiPagePermissionResolver,
  createWikiPagePermissionResolver,
  getEventEndTime,
  type PermissionSet,
} from "@sam-monorepo/domain";
import { loadEffectivePermissionsOfCitizens } from "../auth/effectivePermissionsOfCitizens.js";
import type { ApplicationContext } from "../context.js";
import { triggerNotificationsAfterSave } from "../notifications.js";
import { withSpan } from "../withSpan.js";

/**
 * Limits the work of one run to stay in the time limit of the Lambda
 * function (90 seconds). The next run, 15 minutes later, handles the
 * pending mentions that remain.
 */
const MAXIMUM_MENTIONS_PER_RUN = 200;

export interface NotifyWikiCitizenMentionsOutput {
  /** The mentions that the run read */
  readonly pendingMentionCount: number;
  /**
   * The mentions that passed the gate. They stay pending when
   * `notificationsSent` is false.
   */
  readonly notifiedMentionCount: number;
  readonly suppressedMentionCount: number;
  readonly notificationsSent: boolean;
}

const PENDING_MENTION_SELECT = {
  id: true,
  pageId: true,
  citizenId: true,
  createdById: true,
  page: {
    select: { namespace: true, eventId: true, deletedAt: true },
  },
} satisfies Prisma.WikiPageCitizenMentionSelect;

type PendingMention = Prisma.WikiPageCitizenMentionGetPayload<{
  select: typeof PENDING_MENTION_SELECT;
}>;

const WIKI_PAGE_PERMISSION_SELECT = {
  id: true,
  parentId: true,
  ownerId: true,
  visibility: true,
  editability: true,
  imageUploadability: true,
  attachmentUploadability: true,
  roleAccess: { select: { roleId: true, type: true } },
} satisfies Prisma.WikiPageSelect;

const MENTION_EVENT_SELECT = {
  id: true,
  startTime: true,
  endTime: true,
  createdById: true,
  managers: { select: { id: true } },
  participants: {
    where: { cancelledAt: null },
    select: { citizenId: true },
  },
  positions: {
    select: { id: true, parentPositionId: true, citizenId: true },
  },
  wikiPages: {
    select: {
      id: true,
      parentId: true,
      eventReadScope: true,
      eventReadScopePositionId: true,
      eventEditScope: true,
      eventEditScopePositionId: true,
      imageUploadability: true,
      attachmentUploadability: true,
    },
  },
} satisfies Prisma.EventSelect;

type MentionEvent = Prisma.EventGetPayload<{
  select: typeof MENTION_EVENT_SELECT;
}>;

interface CitizenGrants {
  readonly roleIds: ReadonlySet<string>;
  readonly hasLoginManage: boolean;
  readonly hasWikiManage: boolean;
  readonly hasEventRead: boolean;
  readonly hasEventManage: boolean;
}

const NO_GRANTS: CitizenGrants = {
  roleIds: new Set(),
  hasLoginManage: false,
  hasWikiManage: false,
  hasEventRead: false,
  hasEventManage: false,
};

const hasPermission = (
  permissionSets: PermissionSet[],
  resource: PermissionSet["resource"],
  operation: PermissionSet["operation"],
) => comparePermissionSets({ resource, operation }, permissionSets);

/**
 * The effective role ids and the app-level permissions of each citizen: the
 * wiki read gate must not be looser than the page itself. A deleted citizen
 * gets no grants.
 */
const loadCitizenGrants = async (
  context: ApplicationContext,
  citizenIds: readonly string[],
) => {
  const permissionsByCitizenId = await loadEffectivePermissionsOfCitizens(
    context,
    { id: { in: [...citizenIds] } },
  );

  return new Map(
    citizenIds.map((citizenId): [string, CitizenGrants] => {
      const permissions = permissionsByCitizenId.get(citizenId);
      if (!permissions) return [citizenId, NO_GRANTS];

      const { roleIds, permissionSets } = permissions;
      return [
        citizenId,
        {
          roleIds,
          hasLoginManage: hasPermission(permissionSets, "login", "manage"),
          hasWikiManage: hasPermission(permissionSets, "wiki", "manage"),
          hasEventRead: hasPermission(permissionSets, "event", "read"),
          hasEventManage: hasPermission(permissionSets, "event", "manage"),
        },
      ];
    }),
  );
};

/**
 * Builds the check that a pending mention passes when the mentioned citizen
 * can log in and read the page now. A page of the WIKI namespace uses the
 * role-based resolver. A page of the EVENT namespace uses the event
 * resolver, which keeps unpublished briefings silent.
 */
const createMentionReadGate = async (
  context: ApplicationContext,
  pending: readonly PendingMention[],
) => {
  const citizenIds = [...new Set(pending.map((mention) => mention.citizenId))];
  const hasWikiPageMention = pending.some(
    (mention) => mention.page.namespace === WikiPageNamespace.WIKI,
  );
  const eventIds = [
    ...new Set(
      pending
        .map((mention) => mention.page.eventId)
        .filter((eventId): eventId is string => eventId !== null),
    ),
  ];

  const [grantsByCitizenId, wikiPages, events] = await Promise.all([
    loadCitizenGrants(context, citizenIds),
    hasWikiPageMention
      ? context.prisma.wikiPage.findMany({
          where: { namespace: WikiPageNamespace.WIKI },
          select: WIKI_PAGE_PERMISSION_SELECT,
        })
      : [],
    eventIds.length > 0
      ? context.prisma.event.findMany({
          where: { id: { in: eventIds } },
          select: MENTION_EVENT_SELECT,
        })
      : [],
  ]);

  const eventsById = new Map(events.map((event) => [event.id, event]));
  const eventHasEnded = (event: MentionEvent) =>
    getEventEndTime(event) <= context.now();

  /** One resolver per citizen covers every page of the WIKI namespace */
  const wikiResolvers = new Map<
    string,
    ReturnType<typeof createWikiPagePermissionResolver>
  >();
  const getWikiResolver = (citizenId: string, grants: CitizenGrants) => {
    const cachedResolver = wikiResolvers.get(citizenId);
    if (cachedResolver) return cachedResolver;

    const resolver = createWikiPagePermissionResolver(wikiPages, {
      citizenId,
      roleIds: grants.roleIds,
      hasWikiManage: grants.hasWikiManage,
    });
    wikiResolvers.set(citizenId, resolver);
    return resolver;
  };

  const eventResolvers = new Map<
    string,
    ReturnType<typeof createEventWikiPagePermissionResolver>
  >();
  const getEventResolver = (
    event: MentionEvent,
    citizenId: string,
    grants: CitizenGrants,
  ) => {
    const key = `${event.id}:${citizenId}`;
    const cachedResolver = eventResolvers.get(key);
    if (cachedResolver) return cachedResolver;

    const resolver = createEventWikiPagePermissionResolver(
      event.wikiPages,
      {
        isParticipant: event.participants.some(
          (participant) => participant.citizenId === citizenId,
        ),
        isEventManager:
          event.createdById === citizenId ||
          event.managers.some((manager) => manager.id === citizenId) ||
          grants.hasEventManage,
        positionScopeIds: collectPositionScopeIdsForCitizen(
          event.positions,
          citizenId,
        ),
      },
      { frozen: eventHasEnded(event) },
    );
    eventResolvers.set(key, resolver);
    return resolver;
  };

  return (mention: PendingMention) => {
    const grants = grantsByCitizenId.get(mention.citizenId) ?? NO_GRANTS;
    if (!grants.hasLoginManage) return false;

    if (mention.page.namespace === WikiPageNamespace.WIKI) {
      return (
        getWikiResolver(mention.citizenId, grants).get(mention.pageId)
          ?.canRead === true
      );
    }

    const event = mention.page.eventId
      ? eventsById.get(mention.page.eventId)
      : undefined;
    if (!event || !grants.hasEventRead) return false;

    return (
      getEventResolver(event, mention.citizenId, grants).get(mention.pageId)
        ?.canRead === true
    );
  };
};

/**
 * Turns the pending mention links (written by the collab server) into
 * notification requests, throttled to the 15-minute schedule of this
 * automation. A mention that a user removed before the run has no row, thus
 * nothing fires.
 *
 * The run checks each mention at send time: the mentioned citizen must be
 * able to log in and read the page now. A mention that fails the check, a
 * self-mention and a mention on a page in the trash are suppressed for
 * good, not tried again. The other mentions get a notification request. The
 * run marks them as notified only after the request succeeded, thus a
 * failed request keeps them pending for the next run. A crash between the
 * request and the mark can send a notification twice, but never loses one.
 */
export const notifyWikiCitizenMentions = (
  context: ApplicationContext,
): Promise<NotifyWikiCitizenMentionsOutput> =>
  withSpan(context, "notifyWikiCitizenMentions", async () => {
    const now = context.now();
    const pending = await context.prisma.wikiPageCitizenMention.findMany({
      where: { notifiedAt: null, suppressedAt: null },
      orderBy: { createdAt: "asc" },
      take: MAXIMUM_MENTIONS_PER_RUN,
      select: PENDING_MENTION_SELECT,
    });
    if (pending.length <= 0) {
      return {
        pendingMentionCount: 0,
        notifiedMentionCount: 0,
        suppressedMentionCount: 0,
        notificationsSent: true,
      };
    }

    const mayRead = await createMentionReadGate(context, pending);

    const notifiable: PendingMention[] = [];
    const suppressed: PendingMention[] = [];
    for (const mention of pending) {
      /**
       * The collab server suppresses self-mentions when it saves them. This
       * check is a second safeguard.
       */
      const isSelfMention = mention.citizenId === mention.createdById;

      if (mention.page.deletedAt || isSelfMention || !mayRead(mention)) {
        suppressed.push(mention);
      } else {
        notifiable.push(mention);
      }
    }

    await context.audit.create([
      {
        type: AuditEventType.WIKI_CITIZEN_MENTIONS_SWEPT,
        data: {
          notifiedCount: notifiable.length,
          suppressedCount: suppressed.length,
        },
        createdById: null,
      },
    ]);

    if (suppressed.length > 0) {
      await context.prisma.wikiPageCitizenMention.updateMany({
        where: { id: { in: suppressed.map((mention) => mention.id) } },
        data: { suppressedAt: now },
      });
    }

    let notificationsSent = true;
    if (notifiable.length > 0) {
      notificationsSent = await triggerNotificationsAfterSave(
        context,
        notifiable.map((mention) => ({
          type: "WikiCitizenMentioned",
          payload: { mentionId: mention.id },
        })),
      );

      if (notificationsSent) {
        await context.prisma.wikiPageCitizenMention.updateMany({
          where: { id: { in: notifiable.map((mention) => mention.id) } },
          data: { notifiedAt: now },
        });
      }
    }

    return {
      pendingMentionCount: pending.length,
      notifiedMentionCount: notifiable.length,
      suppressedMentionCount: suppressed.length,
      notificationsSent,
    };
  });
