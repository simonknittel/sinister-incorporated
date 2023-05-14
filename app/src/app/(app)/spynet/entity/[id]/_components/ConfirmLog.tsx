"use client";

import { type EntityLog } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  log: EntityLog;
}

const ConfirmLog = ({ log }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/spynet/entity/${log.entityId}/log/${log.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            confirmed: true,
          }),
        }
      );

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich bestätigt");
      } else {
        toast.error("Beim Bestätigen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Bestätigen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Button
      variant="tertiary"
      className="h-auto"
      onClick={() => void handleClick()}
      disabled={isLoading}
    >
      {isLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
      Bestätigen
    </Button>
  );
};

export default ConfirmLog;
