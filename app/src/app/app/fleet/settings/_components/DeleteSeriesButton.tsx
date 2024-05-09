"use client";

import { type Series } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import Button from "../../../../_components/Button";

type Props = Readonly<{
  series: Pick<Series, "id" | "name">;
}>;

export const DeleteSeriesButton = ({ series }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `Willst du "${series.name}" löschen?`,
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/series/${series.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gelöscht");
      } else {
        toast.error("Beim Löschen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Löschen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="tertiary"
      onClick={() => void handleClick()}
      disabled={isLoading}
      title="Löschen"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />} Löschen
    </Button>
  );
};
