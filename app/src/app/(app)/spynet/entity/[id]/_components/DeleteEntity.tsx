"use client";

import { type Entity } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  entity: Entity;
}

const DeleteEntity = ({ entity }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `Willst du diesen Citizen komplett löschen?`
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/spynet/entity/${entity.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/spynet/search");
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
      title="Citizen löschen"
      onClick={() => void handleClick()}
      disabled={isLoading}
      variant="tertiary"
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />} Löschen
    </Button>
  );
};

export default DeleteEntity;
