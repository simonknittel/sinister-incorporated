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
import { type PenaltyEntry } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deletePenaltyEntry } from "../actions/deletePenaltyEntry";

interface Props {
  readonly className?: string;
  readonly entry: PenaltyEntry;
}

export const DeletePenaltyEntry = ({ className, entry }: Props) => {
  const [isPending, startTransition] = useTransition();
  const id = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await deletePenaltyEntry(formData);

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
    <form action={formAction} id={id} className={className}>
      <input type="hidden" name="id" value={entry.id} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button
            disabled={isPending}
            className="text-sinister-red-500 hover:text-sinister-red-300 flex items-center"
            title="Löschen"
          >
            {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Strafpunkte löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Willst du diesen Eintrag löschen?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>

            <AlertDialogAction type="submit" form={id}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
