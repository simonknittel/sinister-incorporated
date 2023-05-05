"use client";

import { type Variant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  className?: string;
  variantId: Variant["id"];
}

const IncrementOwnership = ({ variantId }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/fleet-ownership", {
        method: "POST",
        body: JSON.stringify({
          variantId,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich hinzugefügt");
      } else {
        toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
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
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
    </Button>
  );
};

export default IncrementOwnership;
