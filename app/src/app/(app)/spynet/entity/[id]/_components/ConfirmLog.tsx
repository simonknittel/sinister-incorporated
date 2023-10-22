"use client";

import { type EntityLog } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaSpinner, FaTimes } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  log: EntityLog;
  compact?: boolean;
}

const ConfirmLog = ({ log, compact }: Readonly<Props>) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | false>(false);

  const handleConfirm = async (confirmed: string) => {
    setIsLoading(confirmed);

    try {
      const response = await fetch(
        `/api/spynet/entity/${log.entityId}/log/${log.id}/confirm`,
        {
          method: "PATCH",
          body: JSON.stringify({
            confirmed,
          }),
        },
      );

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
      } else {
        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  if (compact) {
    return (
      <>
        <Button
          variant="tertiary"
          className="h-auto"
          onClick={() => void handleConfirm("confirmed")}
          disabled={isLoading === "confirmed"}
          title="Bestätigen"
        >
          {isLoading === "confirmed" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaCheck />
          )}
        </Button>
        /
        <Button
          variant="tertiary"
          className="h-auto"
          onClick={() => void handleConfirm("falseReport")}
          disabled={isLoading === "falseReport"}
          title="Falschmeldung"
        >
          {isLoading === "falseReport" ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaTimes />
          )}
        </Button>
      </>
    );
  }

  return (
    <>
      <Button
        variant="tertiary"
        className="h-auto"
        onClick={() => void handleConfirm("confirmed")}
        disabled={isLoading === "confirmed"}
      >
        {isLoading === "confirmed" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaCheck />
        )}
        Bestätigen
      </Button>

      <Button
        variant="tertiary"
        className="h-auto"
        onClick={() => void handleConfirm("falseReport")}
        disabled={isLoading === "falseReport"}
      >
        {isLoading === "falseReport" ? (
          <FaSpinner className="animate-spin" />
        ) : (
          <FaTimes />
        )}
        Falschmeldung
      </Button>
    </>
  );
};

export default ConfirmLog;
