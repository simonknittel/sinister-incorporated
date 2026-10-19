import type { Prisma } from "@sam-monorepo/database/client";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ConflictError, ForbiddenError, NotFoundError } from "../errors.js";
import {
  findEventTemplateAccess,
  type EventTemplateAccess,
} from "./eventTemplateAccess.js";
import { EventTemplateErrorMessage } from "./eventTemplateErrors.js";

interface EventTemplateGuardOptions<Select extends Prisma.EventTemplateSelect> {
  /** The fields that the caller reads from the template */
  readonly select?: Select;
}

/**
 * A template that the actor can delete and restore. A deleted template is in
 * the result: the restore needs it.
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ForbiddenError when the actor cannot manage it
 */
export const requireManageableEventTemplate = async <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  { select }: EventTemplateGuardOptions<Select> = {},
): Promise<EventTemplateAccess<Select>> => {
  const access = await findEventTemplateAccess(
    context,
    actor,
    templateId,
    select ?? ({} as Select),
  );

  if (!access) throw new NotFoundError(EventTemplateErrorMessage.NotFound);

  if (!access.permissions.canManage)
    throw new ForbiddenError("The user cannot manage the event template");

  return access;
};

/**
 * A template whose role shares and owner the actor can change.
 *
 * @throws NotFoundError when the actor cannot read the template,
 *   ConflictError when it is deleted, ForbiddenError when the actor cannot
 *   change its shares
 */
export const requireShareableEventTemplate = async <
  const Select extends Prisma.EventTemplateSelect = Record<never, never>,
>(
  context: ApplicationContext,
  actor: Actor,
  templateId: string,
  { select }: EventTemplateGuardOptions<Select> = {},
): Promise<EventTemplateAccess<Select>> => {
  const access = await findEventTemplateAccess(
    context,
    actor,
    templateId,
    select ?? ({} as Select),
  );

  if (!access) throw new NotFoundError(EventTemplateErrorMessage.NotFound);

  if (access.template.deletedAt !== null)
    throw new ConflictError(EventTemplateErrorMessage.Deleted);

  if (!access.permissions.canManageShares)
    throw new ForbiddenError(
      "The user cannot change the shares of the event template",
    );

  return access;
};
