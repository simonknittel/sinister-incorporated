"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import Button from "@/common/components/Button";
import { SingleRole } from "@/roles/components/SingleRole";
import type { Role, Task, TaskAssignment, Upload } from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaSpinner } from "react-icons/fa";
import { createTaskAssignmentForCurrentUser } from "../actions/createTaskAssignmentForCurrentUser";
import { deleteTaskAssignmentForCurrentUser } from "../actions/deleteTaskAssignmentForCurrentUser";

interface Props {
  readonly className?: string;
  readonly task: Task & {
    readonly assignments: TaskAssignment[];
    readonly requiredRoles: (Role & {
      readonly icon: Upload | null;
    })[];
  };
  readonly isCurrentUserAssigned?: boolean;
}

export const ToggleAssignmentForCurrentUser = ({
  className,
  task,
  isCurrentUserAssigned,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const authentication = useAuthentication();
  if (!authentication || !authentication.session?.entity)
    throw new Error("Unauthorized");
  const doesCurrentUserSatisfyRequirements =
    task.requiredRoles.length > 0 &&
    task.requiredRoles.some((role) =>
      authentication.session.entity!.roles?.split(",").includes(role.id),
    );

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
        <Button type="submit" disabled={isPending} variant="primary">
          Aufgeben
          {isPending ? <FaSpinner className="animate-spin" /> : <FaMinus />}
        </Button>
      ) : doesCurrentUserSatisfyRequirements ? (
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
      ) : (
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                disabled={
                  isPending ||
                  ((task.assignmentLimit &&
                    task.assignments.length >= task.assignmentLimit) ||
                  !doesCurrentUserSatisfyRequirements
                    ? true
                    : false)
                }
                variant="primary"
              >
                Annehmen
                {isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus />
                )}
              </Button>
            </Tooltip.Trigger>

            <Tooltip.Content
              className="p-4 max-w-[320px] select-none rounded bg-neutral-950 border border-sinister-red-500 text-white font-normal"
              sideOffset={5}
            >
              <div>
                <p>Du erfüllst nicht die Voraussetzungen für diesen Task.</p>

                {task.requiredRoles.length > 0 && (
                  <>
                    <p className="text-sm text-gray-500 mt-4">
                      Erforderliche Rolle(n)
                    </p>
                    <div className="flex flex-col items-start gap-1 mt-1">
                      {task.requiredRoles.map((role) => (
                        <SingleRole key={role.id} role={role} />
                      ))}
                    </div>
                  </>
                )}
              </div>
              <Tooltip.Arrow className="fill-sinister-red-500" />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </form>
  );
};
