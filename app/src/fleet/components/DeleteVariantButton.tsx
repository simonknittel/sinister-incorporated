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
import Button from "@/common/components/Button";
import Note from "@/common/components/Note";
import { type Variant } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteVariant } from "../actions/deleteVariant";

interface Props {
  readonly className?: string;
  readonly variant: Pick<Variant, "id" | "name">;
  readonly shipCount: number;
}

export const DeleteVariantButton = ({
  className,
  variant,
  shipCount,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const id = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await deleteVariant(formData);

        if (response.status === 200) {
          toast.success("Erfolgreich gelöscht");
        } else {
          toast.error(
            response.errorMessage || "Beim Löschen ist ein Fehler aufgetreten.",
          );
          console.error(response);
        }
      } catch (error) {
        unstable_rethrow(error);
        toast.error("Beim Löschen ist ein Fehler aufgetreten.");
        console.error(error);
      }
    });
  };

  return (
    <form action={formAction} id={id} className={className}>
      <input type="hidden" name="id" value={variant.id} />

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="tertiary" disabled={isPending}>
            {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
            Löschen
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Schiff löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Willst du &quot;{variant.name}&quot; löschen?
            </AlertDialogDescription>

            {shipCount > 0 && (
              <Note
                type="error"
                message={
                  <p>
                    Diese Variante kann nicht gelöscht werden. Sie wird von{" "}
                    {shipCount} Schiffen verwendet. Kontaktiere <em>ind3x</em>{" "}
                    um sie mit einer anderen zu kombinieren/ersetzen oder zu
                    löschen.
                  </p>
                }
              />
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>

            <AlertDialogAction type="submit" form={id} disabled={shipCount > 0}>
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
};
