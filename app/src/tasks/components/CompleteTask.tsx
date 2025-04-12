"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/common/components/AlertDialog";
import { TaskRewardType, type Task } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { completeTask } from "../actions/completeTask";

type Props = Readonly<{
  className?: string;
  task: Task;
}>;

export const CompleteTask = ({ className, task }: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await completeTask(formData);

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
    <form action={formAction} id={formId} className={className}>
      <input type="hidden" name="id" value={task.id} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={isPending}
            className="text-sinister-red-500 hover:text-sinister-red-300 flex items-center px-2"
            title="Task abschließen"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : <FaCheck />}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Task abschließen?</AlertDialogTitle>
            <AlertDialogDescription>
              {task.rewardType === TaskRewardType.TEXT && (
                <>Bitte denke daran den Citizen ihre Belohnung zu geben.</>
              )}
              {(task.rewardType === TaskRewardType.SILC ||
                task.rewardType === TaskRewardType.NEW_SILC) && (
                <>
                  SILC-Belohnungen werden automatisiert denen zugeschrieben, die
                  den Task angenommen haben.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>

            <AlertDialogAction type="submit" form={formId}>
              Abschließen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
