"use client";

import Button from "@/common/components/Button";
import type { Task, TaskAssignment } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaSpinner } from "react-icons/fa";
import { createTaskAssignmentForCurrentUser } from "../actions/createTaskAssignmentForCurrentUser";
import { deleteTaskAssignmentForCurrentUser } from "../actions/deleteTaskAssignmentForCurrentUser";

type Props = Readonly<{
  className?: string;
  task: Task & {
    assignments: TaskAssignment[];
  };
  isCurrentUserAssigned?: boolean;
}>;

export const ToggleAssignmentForCurrentUser = ({
  className,
  task,
  isCurrentUserAssigned,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = isCurrentUserAssigned
          ? await deleteTaskAssignmentForCurrentUser(formData)
          : await createTaskAssignmentForCurrentUser(formData);

        if ("error" in response) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success);
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  return (
    <form action={formAction} id={formId} className={clsx(className)}>
      <input type="hidden" name="taskId" value={task.id} />

      {isCurrentUserAssigned ? (
        <Button
          type="submit"
          title="Aufgeben"
          disabled={isPending}
          variant="primary"
        >
          Aufgeben
          {isPending ? <FaSpinner className="animate-spin" /> : <FaMinus />}
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={
            isPending ||
            (task.assignmentLimit &&
            task.assignments.length >= task.assignmentLimit
              ? true
              : false)
          }
          variant="primary"
        >
          Annehmen
          {isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
        </Button>
      )}
    </form>
  );
};
