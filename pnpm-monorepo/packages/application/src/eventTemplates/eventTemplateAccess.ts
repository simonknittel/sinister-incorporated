import type { Prisma } from "@sam-monorepo/database/client";
import {
  resolveEventTemplatePermissions,
  type EventTemplateViewer,
  type ResolvedEventTemplatePermissions,
} from "@sam-monorepo/domain";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors.js";
import { EventTemplateErrorMessage } from "./eventTemplateErrors.js";

/**
 * The actor as the template permission resolver needs it. The admin mode is
 * part of `authorize()` and therefore flows into `hasEventManage`, which
 * grants every capability on every template in the resolver.
 */
export const toEventTemplateViewer = (actor: Actor): EventTemplateViewer => ({
  citizenId: actor.citizen?.id ?? null,
  roleIds: actor.roleIds,
  hasEventManage: actor.authorize("event", "manage"),
  hasTemplateShareManage: actor.authorize("eventTemplateShare", "manage"),
});

/**
 * The `where` fragment matching exactly the templates a viewer may see —
 * including their own soft-deleted ones, which they can restore. It mirrors
 * `resolveEventTemplatePermissions()` and exists so no call site (list,
 * detail, picker, duplicate source) can forget the soft-delete or visibility
 * exclusion. Combine it with an `AND` rather than spreading it, so a caller's
 * own `OR` cannot overwrite it.
 *
 * The resolver stays the authority on what a viewer may *do* with a template;
 * this only narrows the rows.
 */
export const buildVisibleEventTemplatesWhere = (
  viewer: EventTemplateViewer,
): Prisma.EventTemplateWhereInput => {
  if (viewer.hasEventManage) return {};

  const alternatives: Prisma.EventTemplateWhereInput[] = [];

  if (viewer.citizenId) alternatives.push({ ownedById: viewer.citizenId });

  if (viewer.roleIds.size > 0)
    alternatives.push({
      deletedAt: null,
      roleAccess: { some: { roleId: { in: [...viewer.roleIds] } } },
    });

  /** Prisma reads an empty OR as "matches nothing", which is what we want */
  return { OR: alternatives };
};

/** The fields of the template that the permission resolver reads */
const EVENT_TEMPLATE_ACCESS_SELECT = {
  id: true,
  ownedById: true,
  deletedAt: true,
  roleAccess: { select: { roleId: true, type: true } },
} as const satisfies Prisma.EventTemplateSelect;

type EventTemplateAccessFields = Prisma.EventTemplateGetPayload<{
  select: typeof EVENT_TEMPLATE_ACCESS_SELECT;
}>;

/**
 * The template with the fields of the select of the caller and the fields of
 * the permission resolver. The select of the caller cannot change the fields
 * of the permission resolver.
 */
export type EventTemplateWithAccess<Select extends Prisma.EventTemplateSelect> =
  Omit<
    Prisma.EventTemplateGetPayload<{ select: Select }>,
    keyof EventTemplateAccessFields
  > &
    EventTemplateAccessFields;

export interface EventTemplateAccess<
  Select extends Prisma.EventTemplateSelect,
> {
  readonly template: EventTemplateWithAccess<Select>;
  readonly permissions: ResolvedEventTemplatePermissions;
}

/**
 * One template with the permissions of the actor, or null when the template
 * does not exist or the actor may not read it — the two are deliberately
 * indistinguishable. A soft-deleted template is in the result for the
 * actors who can restore it.
 */
export const findEventTemplateAccess = async <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  select: Select = {} as Select,
): Promise<EventTemplateAccess<Select> | null> => {
  const viewer = toEventTemplateViewer(actor);

  /**
   * Prisma cannot resolve the payload of a generic select, thus the type of
   * the row comes from `EventTemplateWithAccess`. The access fields come
   * last, thus they always have the shape of the resolver.
   */
  const template = (await context.prisma.eventTemplate.findFirst({
    where: {
      AND: [{ id: templateId }, buildVisibleEventTemplatesWhere(viewer)],
    },
    select: { ...select, ...EVENT_TEMPLATE_ACCESS_SELECT },
  })) as EventTemplateWithAccess<Select> | null;
  if (!template) return null;

  const permissions = resolveEventTemplatePermissions([template], viewer).get(
    template.id,
  );
  if (!permissions?.canRead) return null;

  return { template, permissions };
};

interface EventTemplateGuardOptions<Select extends Prisma.EventTemplateSelect> {
  /** The fields that the caller reads from the template */
  readonly select?: Select;
}

interface EventTemplateRequirement {
  /** Without it, a deleted template gives a ConflictError */
  readonly allowDeleted: boolean;
  readonly permission: keyof ResolvedEventTemplatePermissions;
  readonly forbiddenMessage: string;
}

/**
 * The guard of the four template guards
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ConflictError when it is deleted (except with `allowDeleted`),
 *   ForbiddenError when the actor does not have the permission
 */
const requireEventTemplateAccess = async <
  const Select extends Prisma.EventTemplateSelect,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  select: Select | undefined,
  { allowDeleted, permission, forbiddenMessage }: EventTemplateRequirement,
): Promise<EventTemplateAccess<Select>> => {
  const access = await findEventTemplateAccess(
    context,
    actor,
    templateId,
    select,
  );

  if (!access) throw new NotFoundError(EventTemplateErrorMessage.NotFound);

  if (!allowDeleted && access.template.deletedAt !== null)
    throw new ConflictError(EventTemplateErrorMessage.Deleted);

  if (!access.permissions[permission])
    throw new ForbiddenError(forbiddenMessage);

  return access;
};

/**
 * A template that the actor can read and use.
 *
 * @throws NotFoundError when the actor cannot read the template, and when
 *   the template is deleted (except with `allowDeleted`)
 */
export const requireReadableEventTemplate = async <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  {
    allowDeleted = false,
    select,
  }: EventTemplateGuardOptions<Select> & {
    /** Gives a deleted template too, for example for the lineup page */
    readonly allowDeleted?: boolean;
  } = {},
): Promise<EventTemplateAccess<Select>> => {
  const access = await requireEventTemplateAccess(
    context,
    actor,
    templateId,
    select,
    {
      allowDeleted: true,
      permission: "canRead",
      forbiddenMessage: "The user cannot read the event template",
    },
  );

  /** For a reader, a deleted template does not exist */
  if (!allowDeleted && access.template.deletedAt !== null)
    throw new NotFoundError(EventTemplateErrorMessage.NotFound);

  return access;
};

/**
 * A template that the actor can edit. Templates never freeze, because they
 * have no schedule to be over.
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ConflictError when it is deleted, ForbiddenError when the actor cannot
 *   edit it
 */
export const requireEditableEventTemplate = <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  { select }: EventTemplateGuardOptions<Select> = {},
): Promise<EventTemplateAccess<Select>> =>
  requireEventTemplateAccess(context, actor, templateId, select, {
    allowDeleted: false,
    permission: "canEdit",
    forbiddenMessage: "The user cannot edit the event template",
  });

/**
 * A template that the actor can delete and restore. A deleted template is in
 * the result: the restore needs it.
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ForbiddenError when the actor cannot manage it
 */
export const requireManageableEventTemplate = <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  { select }: EventTemplateGuardOptions<Select> = {},
): Promise<EventTemplateAccess<Select>> =>
  requireEventTemplateAccess(context, actor, templateId, select, {
    allowDeleted: true,
    permission: "canManage",
    forbiddenMessage: "The user cannot manage the event template",
  });

/**
 * A template whose role shares and owner the actor can change.
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ConflictError when it is deleted, ForbiddenError when the actor cannot
 *   change its shares
 */
export const requireShareableEventTemplate = <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  { select }: EventTemplateGuardOptions<Select> = {},
): Promise<EventTemplateAccess<Select>> =>
  requireEventTemplateAccess(context, actor, templateId, select, {
    allowDeleted: false,
    permission: "canManageShares",
    forbiddenMessage: "The user cannot change the shares of the event template",
  });
