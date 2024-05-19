"use client";

import { type Variant } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteVariant } from "../../../../../lib/serverActions/variant";
import Button from "../../../../_components/Button";

type Props = Readonly<{
  variant: Pick<Variant, "id" | "name">;
}>;

export const DeleteVariantButton = ({ variant }: Props) => {
  const [isPending, startTransition] = useTransition();

  const _action = () => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${variant.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteVariant({
          id: variant.id,
        });

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
      <Button
        variant="tertiary"
        disabled={isPending}
        title="Löschen"
        type="submit"
      >
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </form>
  );
};
