import {
  ConfirmationStatus,
  OrganizationMembershipVisibility,
} from "@sam-monorepo/database/browser";
import type { Prisma } from "@sam-monorepo/database/client";
import {
  buildCursorConditions,
  cursorOrderBy,
  type MergedCursorSourceInput,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import {
  CITIZEN_REFERENCE_SELECT,
  type CitizenReferenceRow,
} from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";

const ORGANIZATION_REFERENCE_SELECT = {
  id: true,
  name: true,
  logo: true,
} as const satisfies Prisma.OrganizationSelect;

/** The organization that an activity entry is about */
export type OrganizationActivityOrganization = Prisma.OrganizationGetPayload<{
  select: typeof ORGANIZATION_REFERENCE_SELECT;
}>;

const ORGANIZATION_CREATED_SELECT = {
  ...ORGANIZATION_REFERENCE_SELECT,
  createdAt: true,
  createdBy: { select: CITIZEN_REFERENCE_SELECT },
  /** The name the organization was created under */
  attributeHistoryEntries: {
    where: { attributeKey: "name", oldValue: null },
    orderBy: { createdAt: "asc" },
    take: 1,
    select: { newValue: true },
  },
} as const satisfies Prisma.OrganizationSelect;

const ORGANIZATION_RENAMED_SELECT = {
  id: true,
  attributeKey: true,
  newValue: true,
  createdAt: true,
  createdBy: { select: CITIZEN_REFERENCE_SELECT },
  organization: { select: ORGANIZATION_REFERENCE_SELECT },
} as const satisfies Prisma.OrganizationAttributeHistoryEntrySelect;

const ORGANIZATION_MEMBERSHIP_SELECT = {
  id: true,
  organizationId: true,
  citizenId: true,
  type: true,
  confirmed: true,
  createdAt: true,
  organization: { select: ORGANIZATION_REFERENCE_SELECT },
  citizen: { select: CITIZEN_REFERENCE_SELECT },
  createdBy: { select: CITIZEN_REFERENCE_SELECT },
} as const satisfies Prisma.OrganizationMembershipHistoryEntrySelect;

/** One page request of an activity source of the organizations */
export interface OrganizationActivityInput extends MergedCursorSourceInput {
  /** The key of the source in the merged cursor */
  readonly sourceKey: string;
  /** Only the history of this organization */
  readonly organizationId?: string;
  /** Only the entries of these citizens. Null or nothing: all citizens. */
  readonly actorIds?: readonly string[] | null;
  readonly createdAt?: { readonly gte?: Date; readonly lt?: Date };
}

export interface OrganizationMembershipActivityInput extends OrganizationActivityInput {
  /** Only the history of this citizen */
  readonly citizenId?: string;
  /**
   * Whether this context runs the confirmation workflow. Only there do
   * entries that wait for their confirmation show up, and only for the
   * actors who can confirm them.
   */
  readonly withConfirmation?: boolean;
}

export interface OrganizationCreatedRow extends OrganizationActivityOrganization {
  readonly createdAt: Date;
  /** Null for an organization without a known creator */
  readonly createdBy: CitizenReferenceRow | null;
  /** The name the organization was created under, or null when unknown */
  readonly initialName: string | null;
}

export type OrganizationRenamedRow =
  Prisma.OrganizationAttributeHistoryEntryGetPayload<{
    select: typeof ORGANIZATION_RENAMED_SELECT;
  }>;

export type OrganizationMembershipRow =
  Prisma.OrganizationMembershipHistoryEntryGetPayload<{
    select: typeof ORGANIZATION_MEMBERSHIP_SELECT;
  }>;

/** The conditions of the date range and of the creators */
const buildDateAndActorConditions = ({
  actorIds,
  createdAt,
}: OrganizationActivityInput) => ({
  ...(actorIds ? { createdById: { in: [...actorIds] } } : {}),
  ...(createdAt && Object.keys(createdAt).length > 0 ? { createdAt } : {}),
});

/**
 * Which confirmation states this context may see. Everywhere but the
 * organization page only confirmed entries exist as far as readers are
 * concerned.
 */
const getConfirmationFilter = (
  actor: Pick<Actor, "authorize">,
  withConfirmation?: boolean,
) => {
  if (!withConfirmation) return { confirmed: ConfirmationStatus.CONFIRMED };

  return actor.authorize("organizationMembership", "confirm")
    ? {}
    : { confirmed: ConfirmationStatus.CONFIRMED };
};

/**
 * One page of the creations of organizations. Empty without
 * `organization;read`.
 */
export const findOrganizationCreatedRows = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: OrganizationActivityInput,
): Promise<OrganizationCreatedRow[]> => {
  if (!actor.authorize("organization", "read")) return [];

  const organizations = await context.prisma.organization.findMany({
    where: {
      AND: [
        {
          ...(input.organizationId ? { id: input.organizationId } : {}),
          ...buildDateAndActorConditions(input),
        },
        ...buildCursorConditions(
          input.position,
          input.sourceKey,
          input.direction,
          "createdAt",
        ),
      ],
    },
    orderBy: cursorOrderBy(input.direction, "createdAt"),
    take: input.take,
    select: ORGANIZATION_CREATED_SELECT,
  });

  return organizations.map(({ attributeHistoryEntries, ...organization }) => ({
    ...organization,
    initialName: attributeHistoryEntries[0]?.newValue ?? null,
  }));
};

/**
 * One page of the renames of organizations. Renames never go through the
 * confirmation workflow, because nothing writes an unconfirmed one. Empty
 * without `organization;read`.
 */
export const findOrganizationRenamedRows = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: OrganizationActivityInput,
): Promise<OrganizationRenamedRow[]> => {
  if (!actor.authorize("organization", "read")) return [];

  return context.prisma.organizationAttributeHistoryEntry.findMany({
    where: {
      AND: [
        {
          ...(input.organizationId
            ? { organizationId: input.organizationId }
            : {}),
          ...buildDateAndActorConditions(input),
          /**
           * The row recording the name an organization was created under is
           * told by the creation entry instead.
           */
          NOT: { attributeKey: "name", oldValue: null },
        },
        ...buildCursorConditions(
          input.position,
          input.sourceKey,
          input.direction,
          "createdAt",
        ),
      ],
    },
    orderBy: cursorOrderBy(input.direction, "createdAt"),
    take: input.take,
    select: ORGANIZATION_RENAMED_SELECT,
  });
};

/**
 * One page of the membership entries of the citizens. A redacted entry needs
 * `organizationMembership;read` with the attribute `alsoVisibilityRedacted`.
 * Empty without `organization;read`: this permission gates the source, not
 * `organizationMembership;read`.
 */
export const findOrganizationMembershipRows = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Pick<Actor, "authorize">,
  input: OrganizationMembershipActivityInput,
): Promise<OrganizationMembershipRow[]> => {
  if (!actor.authorize("organization", "read")) return [];

  const alsoVisibilityRedacted = actor.authorize(
    "organizationMembership",
    "read",
    [{ key: "alsoVisibilityRedacted", value: true }],
  );

  return context.prisma.organizationMembershipHistoryEntry.findMany({
    where: {
      AND: [
        {
          ...(input.organizationId
            ? { organizationId: input.organizationId }
            : {}),
          ...(input.citizenId ? { citizenId: input.citizenId } : {}),
          ...buildDateAndActorConditions(input),
          ...getConfirmationFilter(actor, input.withConfirmation),
          visibility: {
            in: alsoVisibilityRedacted
              ? [
                  OrganizationMembershipVisibility.PUBLIC,
                  OrganizationMembershipVisibility.REDACTED,
                ]
              : [OrganizationMembershipVisibility.PUBLIC],
          },
        },
        ...buildCursorConditions(
          input.position,
          input.sourceKey,
          input.direction,
          "createdAt",
        ),
      ],
    },
    orderBy: cursorOrderBy(input.direction, "createdAt"),
    take: input.take,
    select: ORGANIZATION_MEMBERSHIP_SELECT,
  });
};
