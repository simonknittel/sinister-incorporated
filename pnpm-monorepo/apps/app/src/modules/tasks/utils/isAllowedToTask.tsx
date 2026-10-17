import { toActor } from "@/modules/application";
import { requireAuthentication } from "@/modules/auth/server";
import { isAllowedToManageTask as isActorAllowedToManageTask } from "@sam-monorepo/application";
import type { Task } from "@sam-monorepo/database/client";

export const isAllowedToManageTask = async (
  task: Pick<Task, "createdById">,
) => {
  const { session } = await requireAuthentication();

  return isActorAllowedToManageTask(await toActor(session), task);
};

export const isAllowedToDeleteTask = async () => {
  const authentication = await requireAuthentication();

  if (await authentication.authorize("task", "delete")) return true;

  return false;
};
