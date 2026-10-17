import { toActor } from "@/modules/application";
import {
  getEffectiveRoles,
  requireAuthentication,
} from "@/modules/auth/server";
import { getVisibleTasksWhere as getVisibleTasksWhereOfActor } from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";
import { forbidden } from "next/navigation";

/**
 * The tasks the current viewer may see, as a Prisma where fragment (see
 * `getVisibleTasksWhere` of the application package)
 */
export const getVisibleTasksWhere =
  async (): Promise<Prisma.TaskWhereInput> => {
    const { session } = await requireAuthentication();
    if (!session.entity) forbidden();

    const { roleIds } = await getEffectiveRoles(session.entity.id);

    return getVisibleTasksWhereOfActor(await toActor(session), roleIds);
  };
