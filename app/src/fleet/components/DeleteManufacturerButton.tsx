"use client";

import Button from "@/common/components/Button";
import { type Manufacturer } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteManufacturer } from "../actions/manufacturer";

type Props = Readonly<{
  manufacturer: Pick<Manufacturer, "id" | "name">;
}>;

export const DeleteManufacturerButton = ({ manufacturer }: Props) => {
  const [isPending, startTransition] = useTransition();

  const _action = (formData: FormData) => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${manufacturer.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteManufacturer(formData);

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
    <form action={_action}>
      <input type="hidden" name="id" value={manufacturer.id} />
      <Button disabled={isPending} variant="tertiary" type="submit">
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </form>
  );
};
