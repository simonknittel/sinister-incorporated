"use client";

import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import type { Event } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { updateEventLineupEnabled } from "../actions/updateEventLineupEnabled";

interface Props {
  readonly className?: string;
  readonly event: Event;
}

export const UpdateEventLineupEnabled = ({ className, event }: Props) => {
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await updateEventLineupEnabled(formData);

        if ("error" in response) {
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
    <form action={formAction} className={clsx("flex items-center", className)}>
      <input type="hidden" name="eventId" value={event.id} />

      <YesNoCheckbox
        name="value"
        value="true"
        disabled={isPending}
        onChange={(e) => e.target.form?.requestSubmit()}
        defaultChecked={event.lineupEnabled}
        yesLabel="Aktiviert"
        noLabel="Deaktiviert"
        labelClassName="w-auto"
      />
    </form>
  );
};
