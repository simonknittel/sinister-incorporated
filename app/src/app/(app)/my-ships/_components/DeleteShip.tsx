"use client";

import { type Ship, type Variant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  ship: Ship & {
    variant: Variant;
  };
}

const DeleteShip = ({ ship }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `You are about to remove "${
          ship.name || ship.variant.name
        }". Do you want to continue?`
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/ship/${ship.id}`, {
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
      variant="secondary"
      onClick={() => void handleClick()}
      disabled={isLoading}
    >
      Löschen {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
    </Button>
  );
};

export default DeleteShip;
