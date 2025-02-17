"use client";

import type { EventPosition } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSpinner } from "react-icons/fa";
import { createEventPositionApplicationForCurrentUser } from "../actions/createEventPositionApplicationForCurrentUser";

type Props = Readonly<{
  className?: string;
  position: EventPosition;
}>;

export const CreateEventPositionApplicationForCurrentUser = ({
  className,
  position,
}: Props) => {
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response =
          await createEventPositionApplicationForCurrentUser(formData);

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

      <button
        type="submit"
        title="Für diesen Posten interessiert melden"
        disabled={isPending}
        className="px-1 text-sinister-red-500 hover:text-sinister-red-300 text-sm"
      >
        {isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </button>
    </form>
  );
};
