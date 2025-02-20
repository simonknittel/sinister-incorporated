"use client";

import type {
  Entity,
  EventPosition,
  EventPositionApplication,
  Manufacturer,
  Series,
  Variant,
} from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useTransition, type ChangeEventHandler } from "react";
import toast from "react-hot-toast";
import { resetEventPositionCitizenId } from "../actions/resetEventPositionCitizenId";
import { updateEventPositionCitizenId } from "../actions/updateEventPositionCitizenId";

type Props = Readonly<{
  className?: string;
  position: EventPosition & {
    applications: (EventPositionApplication & {
      citizen: Entity;
    })[];
    requiredVariant?: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
  eventCitizenSatisfyingRequirements: Entity[];
  eventCitizenNotSatisfyingRequirements: Entity[];
}>;

export const UpdateEventPositionCitizenId = ({
  className,
  position,
  eventCitizenSatisfyingRequirements,
  eventCitizenNotSatisfyingRequirements,
}: Props) => {
  const [isPending, startTransition] = useTransition();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const formData = new FormData();
    formData.set("positionId", position.id);
    formData.set("citizenId", event.target.value);

    startTransition(async () => {
      try {
        const response =
          event.target.value === "-"
            ? await resetEventPositionCitizenId(formData)
            : await updateEventPositionCitizenId(formData);

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
        name="citizenId"
        className="block w-full p-2 bg-neutral-900 text-neutral-100 rounded cursor-pointer"
        onChange={handleChange}
        disabled={isPending}
        defaultValue={position.citizenId || "-"}
      >
        <option value="-">-</option>

        <optgroup label="Interessenten - Voraussetzungen erfüllt"></optgroup>

        <optgroup label="Interessenten - Voraussetzungen nicht erfüllt">
          {position.applications
            .sort((a, b) =>
              (a.citizen.handle || a.citizen.id).localeCompare(
                b.citizen.handle || b.citizen.id,
              ),
            )
            .map((application) => (
              <option key={application.citizenId} value={application.citizenId}>
                {application.citizen.handle}
              </option>
            ))}
        </optgroup>

        <optgroup label="Alle Teilnehmer - Voraussetzungen erfüllt">
          {eventCitizenSatisfyingRequirements
            .sort((a, b) => (a.handle || a.id).localeCompare(b.handle || b.id))
            .map((citizen) => (
              <option key={citizen.id} value={citizen.id}>
                {citizen.handle}
              </option>
            ))}
        </optgroup>

        <optgroup label="Alle Teilnehmer - Voraussetzungen nicht erfüllt">
          {eventCitizenNotSatisfyingRequirements
            .sort((a, b) => (a.handle || a.id).localeCompare(b.handle || b.id))
            .map((citizen) => (
              <option key={citizen.id} value={citizen.id}>
                {citizen.handle}
              </option>
            ))}
        </optgroup>
      </select>
    </div>
  );
};
