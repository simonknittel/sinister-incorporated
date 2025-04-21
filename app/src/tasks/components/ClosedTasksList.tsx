"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import type { ComponentProps } from "react";
import { Task } from "./Task";
import { TaskVisibilityProvider, ToggleAll } from "./TaskVisibilityContext";

interface Props {
  readonly tasks: ComponentProps<typeof Task>["task"][];
}

export const ClosedTasksList = ({ tasks }: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const sortedTasks = tasks.toSorted((a, b) => {
    const aDate = a.completedAt
      ? a.completedAt
      : a.cancelledAt
        ? a.cancelledAt
        : a.deletedAt
          ? a.deletedAt
          : a.expiresAt
            ? a.expiresAt
            : a.createdAt;
    const bDate = b.completedAt
      ? b.completedAt
      : b.cancelledAt
        ? b.cancelledAt
        : b.deletedAt
          ? b.deletedAt
          : b.expiresAt
            ? b.expiresAt
            : b.createdAt;

    if (aDate > bDate) return -1;
    if (aDate < bDate) return 1;

    return 0;
  });

  return (
    <TaskVisibilityProvider items={sortedTasks}>
      <ToggleAll className="justify-center" />

      <section className="flex flex-col gap-[1px] mt-4">
        {sortedTasks.map((task) => (
          <Task key={task.id} task={task} />
        ))}
      </section>
    </TaskVisibilityProvider>
  );
};
