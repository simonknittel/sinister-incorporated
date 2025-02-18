"use client";

import Button from "@/common/components/Button";
import type { EventPosition } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaSpinner } from "react-icons/fa";
import { createEventPositionApplicationForCurrentUser } from "../actions/createEventPositionApplicationForCurrentUser";
import { deleteEventPositionApplicationForCurrentUser } from "../actions/deleteEventPositionApplicationForCurrentUser";

type Props = Readonly<{
  className?: string;
  position: EventPosition;
  hasCurrentUserAlreadyApplied?: boolean;
}>;

export const ToggleEventPositionApplicationForCurrentUser = ({
  className,
  position,
  hasCurrentUserAlreadyApplied,
}: Props) => {
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = hasCurrentUserAlreadyApplied
          ? await deleteEventPositionApplicationForCurrentUser(formData)
          : await createEventPositionApplicationForCurrentUser(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success);
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  return (
    <form action={formAction} className={clsx(className)}>
      <input type="hidden" name="positionId" value={position.id} />

      <Button
        type="submit"
        title={
          hasCurrentUserAlreadyApplied
            ? "Abmelden"
            : "Für diesen Posten Interesse anmelden"
        }
        disabled={isPending}
        variant="secondary"
      >
        {hasCurrentUserAlreadyApplied ? "Abmelden" : "Interesse anmelden"}{" "}
        {isPending ? (
          <FaSpinner className="animate-spin" />
        ) : hasCurrentUserAlreadyApplied ? (
          <FaMinus />
        ) : (
          <FaPlus />
        )}
      </Button>
    </form>
  );
};
