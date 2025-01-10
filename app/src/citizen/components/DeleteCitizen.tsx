"use client";

import Button from "@/common/components/Button";
import { type Entity } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaSpinner, FaTrash } from "react-icons/fa";

type Props = Readonly<{
  entity: Entity;
}>;

export const DeleteCitizen = ({ entity }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const confirmation = window.confirm(
        `Willst du diesen Citizen komplett löschen?`,
      );

      if (!confirmation) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/spynet/citizen/${entity.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/app/spynet/search");
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
    <>
      <Button
        title="Löschen"
        onClick={() => void handleClick()}
        disabled={isLoading}
        variant="tertiary"
        className="sm:hidden"
        iconOnly={true}
      >
        {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}
      </Button>

      <Button
        onClick={() => void handleClick()}
        disabled={isLoading}
        variant="tertiary"
        className="hidden sm:flex"
      >
        {isLoading ? <FaSpinner className="animate-spin" /> : <FaTrash />}{" "}
        Löschen
      </Button>
    </>
  );
};
