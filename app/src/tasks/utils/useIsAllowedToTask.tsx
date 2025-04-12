"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import type { Task } from "@prisma/client";

export const useIsAllowedToManageTask = (task: Pick<Task, "createdById">) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  if (task.createdById === authentication.session.entityId) return true;

  if (authentication.authorize("task", "manage")) return true;

  return false;
};

export const useIsAllowedToDeleteTask = () => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  if (authentication.authorize("task", "delete")) return true;

  return false;
};
