import type { Prisma } from "@sam-monorepo/database/client";
import { NOTIFIABLE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import type { ApplicationContext } from "../../context.js";
import type { Recipient } from "./recipient.js";

/** The recipients of a notification about an event */
export interface EventNotificationRecipients {
  readonly event: { readonly id: string; readonly name: string };
  readonly recipients: Recipient[];
}

/** The fields of an event that `buildEventRecipientWhere()` reads */
export const EVENT_RECIPIENT_SELECT = {
  visibility: true,
  createdById: true,
  managers: { select: { id: true } },
  visibilityRoles: { select: { roleId: true } },
} satisfies Prisma.EventSelect;

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
