"use client";

import { type Variant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  className?: string;
  variantId: Variant["id"];
}

const DecrementOwnership = ({ variantId }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/fleet-ownership/${variantId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich entfernt");
      } else {
        toast.error("Beim Entfernen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Entfernen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="tertiary"
      onClick={() => void onClick()}
      disabled={isLoading}
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaMinus />}
    </Button>
  );
};

export default DecrementOwnership;
