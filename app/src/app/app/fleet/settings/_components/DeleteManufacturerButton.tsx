"use client";

import { type Manufacturer } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteManufacturer } from "../../../../../lib/serverActions/manufacturer";
import Button from "../../../../_components/Button";

type Props = Readonly<{
  manufacturer: Pick<Manufacturer, "id" | "name">;
}>;

export const DeleteManufacturerButton = ({ manufacturer }: Props) => {
  const [isPending, startTransition] = useTransition();

  const _action = () => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${manufacturer.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteManufacturer({
          id: manufacturer.id,
        });

        if (response.status === 200) {
          toast.success("Erfolgreich gelöscht");
        } else {
          toast.error(
            response.message || "Beim Löschen ist ein Fehler aufgetreten.",
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
      <Button
        title="Löschen"
        disabled={isPending}
        variant="tertiary"
        type="submit"
      >
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </form>
  );
};
