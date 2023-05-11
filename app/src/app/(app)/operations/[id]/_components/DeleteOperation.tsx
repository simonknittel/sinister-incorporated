"use client";

import { type Operation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";

interface Props {
  operation: Operation;
}

const DeleteOperation = ({ operation }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `Willst du wirklich die gesamte Operation löschen?`
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/operation/${operation.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/operations");
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
    <button
      className="text-neutral-500 hover:text-neutral-300 px-2"
      type="button"
      title="Gesamte Operation löschen"
      onClick={() => void handleClick()}
      disabled={isLoading}
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
    </button>
  );
};

export default DeleteOperation;
