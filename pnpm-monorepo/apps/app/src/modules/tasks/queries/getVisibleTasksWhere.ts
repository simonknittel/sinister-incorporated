import { getRequestActor } from "@/modules/application";
import { getVisibleTasksWhere as getVisibleTasksWhereOfActor } from "@sam-monorepo/application";
import type { Prisma } from "@sam-monorepo/database/client";
import { forbidden } from "next/navigation";

/**
 * The tasks the current viewer may see, as a Prisma where fragment (see
 * `getVisibleTasksWhere` of the application package)
 */
export const getVisibleTasksWhere =
  async (): Promise<Prisma.TaskWhereInput> => {
    const actor = await getRequestActor();
    if (!actor.citizen) forbidden();

    return getVisibleTasksWhereOfActor(actor);
  };
