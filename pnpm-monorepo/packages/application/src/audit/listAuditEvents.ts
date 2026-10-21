import type { Prisma } from "@sam-monorepo/database/client";
import { HIGH_VOLUME_AUDIT_EVENT_TYPES } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import {
  CITIZEN_REFERENCE_SELECT,
  toCitizenReference,
  type CitizenReference,
} from "../citizenReference.js";
import type { ApplicationContext } from "../context.js";
import {
  DATE_TIME_INPUT_DESCRIPTION,
  dateTimeInputSchema,
} from "../dateTime.js";
import {
  cursorSchema,
  idSchema,
  pageLimitSchema,
  paginateByDatabaseCursor,
  type PageOptions,
} from "../pagination.js";

/** The maximum number of values of a filter. It keeps the query small. */
const MAXIMUM_FILTER_VALUES = 50;

export const listAuditEventsInputSchema = z.object({
  types: z
    .array(
      // The names of `AuditEventType` are much shorter than 100 characters
      z.string().regex(/^[A-Z0-9_]{1,100}$/),
    )
    .max(MAXIMUM_FILTER_VALUES)
    .optional()
    .describe(
      "Only the events of these types, for example TASK_CREATED, SHIP_CREATED_V2 or ROLE_ASSIGNMENT_CREATED. Use the type values of earlier results. A type filter also shows the high-volume types (see include_high_volume).",
    ),
  created_by_user_ids: z
    .array(idSchema)
    .max(MAXIMUM_FILTER_VALUES)
    .optional()
    .describe(
      "Only the events of these users: created_by.user_id of earlier results, or user_id of get_current_user.",
    ),
  created_by_citizen_ids: z
    .array(idSchema)
    .max(MAXIMUM_FILTER_VALUES)
    .optional()
    .describe(
      "Only the events of the users of these citizens: the citizen ids of earlier results, for example from list_citizens or get_citizen.",
    ),
  from: dateTimeInputSchema
    .optional()
    .describe(
      `Only the events at or after this time. ${DATE_TIME_INPUT_DESCRIPTION}`,
    ),
  to: dateTimeInputSchema
    .optional()
    .describe(
      `Only the events before this time. ${DATE_TIME_INPUT_DESCRIPTION}`,
    ),
  include_high_volume: z
    .boolean()
    .default(false)
    .describe(
      `Also the types that the app writes per page view, per notification or per automation run, which the list hides without this flag or a type filter: ${[...HIGH_VOLUME_AUDIT_EVENT_TYPES].join(", ")}.`,
    ),
  limit: pageLimitSchema,
  cursor: cursorSchema.optional(),
});

export type ListAuditEventsInput = z.output<typeof listAuditEventsInputSchema>;

export interface AuditEventCreatorOutput {
  readonly user_id: string;
  readonly name: string | null;
  /** Null for a user without a citizen or with a deleted citizen */
  readonly citizen: CitizenReference | null;
}

export interface AuditEventOutput {
  readonly id: string;
  readonly type: string;
  readonly created_at: string;
  /** Null for an event without a user (for example an automation run) */
  readonly created_by: AuditEventCreatorOutput | null;
  /**
   * The payload as the app stored it. Older rows store it JSON-encoded as a
   * string.
   */
  readonly data: unknown;
}

export interface ListAuditEventsOutput {
  readonly events: AuditEventOutput[];
  readonly next_cursor: string | null;
  readonly previous_cursor: string | null;
}

const AUDIT_EVENT_SELECT = {
  id: true,
  type: true,
  createdAt: true,
  data: true,
  createdBy: {
    select: {
      id: true,
      name: true,
      citizen: { select: CITIZEN_REFERENCE_SELECT },
    },
  },
} as const satisfies Prisma.AuditEventSelect;

/**
 * An explicit type filter always wins, thus a filter for a high-volume type
 * never gives an empty list because of `include_high_volume`.
 */
const buildTypeWhere = (
  input: ListAuditEventsInput,
): Prisma.AuditEventWhereInput => {
  if (input.types && input.types.length > 0)
    return { type: { in: input.types } };

  if (input.include_high_volume) return {};

  return { type: { notIn: [...HIGH_VOLUME_AUDIT_EVENT_TYPES] } };
};

const buildWhere = (
  input: ListAuditEventsInput,
): Prisma.AuditEventWhereInput => ({
  ...buildTypeWhere(input),
  ...(input.created_by_user_ids && input.created_by_user_ids.length > 0
    ? { createdById: { in: input.created_by_user_ids } }
    : {}),
  ...(input.created_by_citizen_ids && input.created_by_citizen_ids.length > 0
    ? { createdBy: { citizen: { id: { in: input.created_by_citizen_ids } } } }
    : {}),
  ...(input.from || input.to
    ? {
        createdAt: {
          ...(input.from ? { gte: input.from } : {}),
          ...(input.to ? { lt: input.to } : {}),
        },
      }
    : {}),
});

const toAuditEventOutput = (
  event: Prisma.AuditEventGetPayload<{ select: typeof AUDIT_EVENT_SELECT }>,
): AuditEventOutput => ({
  id: event.id,
  type: event.type,
  created_at: event.createdAt.toISOString(),
  created_by: event.createdBy && {
    user_id: event.createdBy.id,
    name: event.createdBy.name,
    citizen: toCitizenReference(event.createdBy.citizen),
  },
  data: event.data,
});

/**
 * The audit events of the system log, the newest first. The cursor is the id
 * of an event.
 *
 * @throws ForbiddenError when the actor does not have `systemLog;read`
 * @throws ValidationError when no event has the cursor (see
 * `PageOptions.unknownCursor`)
 */
export const listAuditEvents = async (
  context: ApplicationContext,
  actor: Actor,
  input: ListAuditEventsInput,
  { direction, unknownCursor }: PageOptions = {},
): Promise<ListAuditEventsOutput> => {
  requirePermission(actor, "systemLog", "read");

  const where = buildWhere(input);

  const page = await paginateByDatabaseCursor(
    {
      cursor: input.cursor,
      pageSize: input.limit,
      direction,
      unknownCursor,
    },
    (cursorArguments) =>
      context.prisma.auditEvent.findMany({
        where,
        // The events of one batch can have the same `createdAt`, thus `id`
        // makes the order total
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: AUDIT_EVENT_SELECT,
        ...cursorArguments,
      }),
    async (id) =>
      (await context.prisma.auditEvent.count({ where: { id } })) > 0,
  );

  return {
    events: page.items.map(toAuditEventOutput),
    next_cursor: page.nextCursor,
    previous_cursor: page.previousCursor,
  };
};
