import type { Prisma } from "@sam-monorepo/database/client";
import {
  buildEventRecipientWhere,
  NOTIFIABLE_CITIZEN_WHERE,
} from "@sam-monorepo/domain";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";

/** The recipients of a notification about an event */
export interface EventNotificationRecipients {
  readonly event: { readonly id: string; readonly name: string };
  readonly recipients: Recipient[];
}

/**
 * Loads an event and gives the recipient filter of
 * `buildEventRecipientWhere()` for it. Gives null when the event does not
 * exist.
 */
export const loadEventRecipientWhere = async (
  context: ApplicationContext,
  eventId: string,
): Promise<Prisma.CitizenWhereInput | null> => {
  const event = await context.prisma.event.findUnique({
    where: {
      id: eventId,
    },
    select: {
      visibility: true,
      createdById: true,
      managers: { select: { id: true } },
      visibilityRoles: { select: { roleId: true } },
    },
  });
  if (!event) return null;

  return buildEventRecipientWhere(event);
};

/**
 * The citizens that match the filter and that the event notifications can
 * reach, see `NOTIFIABLE_CITIZEN_WHERE`
 */
export const findNotifiableRecipients = async (
  context: ApplicationContext,
  where: Prisma.CitizenWhereInput,
): Promise<Recipient[]> => {
  const citizens = await context.prisma.citizen.findMany({
    where: {
      AND: [where, NOTIFIABLE_CITIZEN_WHERE],
    },
    select: {
      id: true,
    },
  });

  return citizens.map((citizen) => ({ citizenId: citizen.id }));
};
