"use client";

import Button from "@/common/components/Button";
import { type Series } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteSeries } from "../actions/series";

type Props = Readonly<{
  series: Pick<Series, "id" | "name">;
}>;

export const DeleteSeriesButton = ({ series }: Props) => {
  const [isPending, startTransition] = useTransition();

  const _action = (formData: FormData) => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${series.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteSeries(formData);

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
      <input type="hidden" name="id" value={series.id} />
      <Button variant="tertiary" disabled={isPending} type="submit">
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </form>
  );
};
