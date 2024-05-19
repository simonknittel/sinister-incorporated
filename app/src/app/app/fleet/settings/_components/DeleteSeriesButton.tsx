"use client";

import { type Series } from "@prisma/client";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import { deleteSeries } from "../../../../../lib/serverActions/series";
import Button from "../../../../_components/Button";

type Props = Readonly<{
  series: Pick<Series, "id" | "name">;
}>;

export const DeleteSeriesButton = ({ series }: Props) => {
  const [isPending, startTransition] = useTransition();

  const _action = () => {
    startTransition(async () => {
      try {
        const confirmation = window.confirm(
          `Willst du "${series.name}" löschen?`,
        );
        if (!confirmation) return;

        const response = await deleteSeries({
          id: series.id,
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
      <Button variant="tertiary" disabled={isPending}>
        {isPending ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </form>
  );
};
