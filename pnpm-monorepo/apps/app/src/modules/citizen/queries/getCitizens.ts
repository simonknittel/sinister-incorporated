import { prisma } from "@/db";
import { requireAuthentication } from "@/modules/auth/server";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { ACTIVE_CITIZEN_WHERE } from "@sam-monorepo/domain";

/**
 * Every citizen as the pickers offer them: the combobox searches the handle
 * and submits the id, and the wiki's mention suggestions do the same. The
 * list is unbounded and crosses to the browser through tRPC, so it carries
 * nothing else.
 */
export const getCitizens = withTrace("getCitizens", async () => {
  const authentication = await requireAuthentication();
  if (!(await authentication.authorize("citizen", "read")))
    throw new Error("Forbidden");

  return prisma.citizen.findMany({
    where: ACTIVE_CITIZEN_WHERE,
    select: {
      id: true,
      handle: true,
      deletedAt: true,
    },
  });
});
