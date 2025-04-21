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
import { type Task } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import { TbCancel } from "react-icons/tb";
import { cancelTask } from "../actions/cancelTask";

interface Props {
  readonly className?: string;
  readonly task: Task;
}

export const CancelTask = ({ className, task }: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await cancelTask(formData);

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
            title="Task abbrechen"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : <TbCancel />}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Task abbrechen?</AlertDialogTitle>
            <AlertDialogDescription>
              Willst du den Task <span className="font-bold">{task.title}</span>{" "}
              abbrechen?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>

            <AlertDialogAction type="submit" form={formId}>
              Speichern
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
