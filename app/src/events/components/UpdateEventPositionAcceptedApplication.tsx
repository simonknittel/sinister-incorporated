"use client";

import type {
  Entity,
  EventPosition,
  EventPositionApplication,
} from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useTransition, type ChangeEventHandler } from "react";
import toast from "react-hot-toast";
import { updateEventPositionAcceptedApplication } from "../actions/updateEventPositionAcceptedApplication";

type Props = Readonly<{
  className?: string;
  position: EventPosition & {
    applications: (EventPositionApplication & {
      citizen: Entity;
    })[];
    acceptedApplication:
      | (EventPositionApplication & {
          citizen: Entity;
        })
      | null;
  };
}>;

export const UpdateEventPositionAcceptedApplication = ({
  className,
  position,
}: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const formData = new FormData();
    formData.set("positionId", position.id);
    formData.set("applicationId", event.target.value);

    startTransition(async () => {
      try {
        const response = await updateEventPositionAcceptedApplication(formData);

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
    <div className={clsx(className)}>
      <input type="hidden" name="positionId" value={position.id} />
      <select
        name="applicationId"
        className="block w-full p-2 bg-neutral-900 text-neutral-100 rounded cursor-pointer"
        onChange={handleChange}
        disabled={isPending}
        defaultValue={position.acceptedApplication?.id}
      >
        <option value="">Bitte wählen</option>

        <optgroup label="Anforderungen erfüllt"></optgroup>

        <optgroup label="Anforderungen nicht erfüllt">
          {position.applications.map((application) => (
            <option key={application.id} value={application.id}>
              {application.citizen.handle}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};
