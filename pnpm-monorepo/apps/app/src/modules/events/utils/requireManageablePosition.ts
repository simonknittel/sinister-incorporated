import { prisma } from "@/db";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import type { EventPosition, Prisma } from "@sam-monorepo/database/client";
import type { getTranslations } from "next-intl/server";
import { authorizeEventContainer } from "./authorizeEventContainer";
import { getPositionContainer, type EventContainer } from "./eventContainer";

const POSITION_SELECT = {
  id: true,
  name: true,
  eventId: true,
  templateId: true,
  citizenId: true,
  order: true,
  parentPositionId: true,
  fontSize: true,
  backgroundColor: true,
  textColor: true,
} satisfies Prisma.EventPositionSelect;

export type ManageablePosition = Prisma.EventPositionGetPayload<{
  select: typeof POSITION_SELECT;
}>;

interface Failure {
  error: string;
  requestPayload: FormData;
}

type RequireManageablePositionResult =
  | {
      position: ManageablePosition;
      container: EventContainer;
      failure?: never;
    }
  | { position?: never; container?: never; failure: Failure };

/**
 * The shared guard of the lineup mutations of the app that also change the
 * lineup of a template: the position must exist and the current user must be
 * allowed to edit the container it belongs to (see
 * `authorizeEventContainer`). Returns the position with its container, or
 * the error response the action should return as-is. A position that is gone
 * refreshes the page, thus call it only in a server action.
 */
export const requireManageablePosition = async (
  positionId: EventPosition["id"],
  formData: FormData,
  t: Awaited<ReturnType<typeof getTranslations>>,
): Promise<RequireManageablePositionResult> => {
  const position = await prisma.eventPosition.findUnique({
    where: { id: positionId },
    select: POSITION_SELECT,
  });

  const container = position ? getPositionContainer(position) : null;
  if (!position || !container)
    return { failure: rejectConflict("Posten nicht gefunden", formData) };

  const authorization = await authorizeEventContainer(container, t);
  if (!authorization.allowed)
    return {
      failure: { error: authorization.error, requestPayload: formData },
    };

  return { position, container };
};
