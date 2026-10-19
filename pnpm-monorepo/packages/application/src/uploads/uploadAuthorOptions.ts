import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";

export interface UploadAuthorOption {
  readonly id: string;
  readonly handle: string | null;
}

/**
 * The citizens with at least one upload, for the author filter of the upload
 * table, sorted by handle. Only the managers have the filter: without the
 * permission, the table shows only one author. A deleted citizen is not an
 * option, as in all other pickers.
 *
 * @throws ForbiddenError when the actor does not have `upload;manage`
 */
export const findUploadAuthorOptions = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
): Promise<UploadAuthorOption[]> => {
  requirePermission(actor, "upload", "manage");

  return context.prisma.citizen.findMany({
    where: { ...ACTIVE_CITIZEN_WHERE, uploads: { some: {} } },
    select: { id: true, handle: true },
    orderBy: { handle: "asc" },
  });
};
