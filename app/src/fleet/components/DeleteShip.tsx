"use client";

import { type Ship, type Variant } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteShipAction } from "../actions/deleteShipAction";

type Props = Readonly<{
  ship: Ship & {
    variant: Variant;
  };
}>;

export const DeleteShip = ({ ship }: Props) => {
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${ship.name || ship.variant.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteShipAction(formData);

        if (response.status === 200) {
          toast.success("Erfolgreich gelöscht");
        } else {
          toast.error(
            response.errorMessage || "Beim Löschen ist ein Fehler aufgetreten.",
          );
        }
      } catch (error) {
        toast.error("Beim Löschen ist ein Fehler aufgetreten.");
        console.error(error);
      }
    });
  };

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={ship.id} />
      <button
        disabled={isPending}
        className="px-2 py-2 text-neutral-500 hover:text-neutral-50"
        title="Löschen"
      >
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}
      </button>
    </form>
  );
};
