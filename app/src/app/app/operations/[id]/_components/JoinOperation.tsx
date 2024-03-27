"use client";

import { type Operation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSpinner } from "react-icons/fa";
import Button from "../../../../_components/Button";

interface Props {
  operation: Operation;
}

const JoinOperation = ({ operation }: Readonly<Props>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/operation-member`, {
        method: "POST",
        body: JSON.stringify({
          operationId: operation.id,
          status: "pending",
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich beigetreten");
      } else {
        toast.error("Beim Beitreten ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Beitreten ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Button
      type="button"
      variant="tertiary"
      onClick={() => void handleClick()}
      disabled={isLoading}
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      Beitreten
    </Button>
  );
};

export default JoinOperation;
