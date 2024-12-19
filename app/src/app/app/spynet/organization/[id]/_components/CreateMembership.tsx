"use client";

import { useAuthentication } from "@/auth/client";
import {
  type OrganizationMembershipType,
  type OrganizationMembershipVisibility,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import Button from "../../../../../_components/Button";
import Modal from "../../../../../_components/Modal";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";

interface FormValues {
  citizenId: string;
  type: OrganizationMembershipType;
  visibility: OrganizationMembershipVisibility;
  confirmed?: "CONFIRMED";
}

type Props = Readonly<{
  className?: string;
  organizationId: string;
}>;

export const CreateMembership = ({ className, organizationId }: Props) => {
  const authentication = useAuthentication();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      type: "MAIN",
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const citizenIdInputId = useId();
  const typeInputId = useId();
  const visibilityInputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data, e) => {
    setIsLoading(true);
    if (
      !(e?.nativeEvent instanceof SubmitEvent) ||
      !(e.nativeEvent.submitter instanceof HTMLButtonElement)
    )
      return;

    try {
      const response = await fetch(
        `/api/spynet/organization/${organizationId}/membership`,
        {
          method: "POST",
          body: JSON.stringify({
            citizenId: data.citizenId,
            type: data.type,
            redacted: data.visibility || false,
            confirmed:
              e.nativeEvent.submitter.name === "confirmed"
                ? "CONFIRMED"
                : undefined,
          }),
        },
      );

      if (response.ok) {
        router.refresh();
        reset();
        setIsOpen(false);
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

  const showCreateAndConfirmButton =
    authentication &&
    authentication.authorize("organizationMembership", "confirm");

  return (
    <>
      <Button
        className={className}
        variant="tertiary"
        onClick={() => setIsOpen(true)}
        title="Citizen hinzufügen"
      >
        <FaPlus /> Hinzufügen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Citizen hinzufügen</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={citizenIdInputId}>
            Citizen
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={citizenIdInputId}
            {...register("citizenId", { required: true })}
            autoFocus
          />

          <label className="mt-6 block" htmlFor={typeInputId}>
            Typ
          </label>

          <select
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={typeInputId}
            {...register("type", { required: true })}
          >
            <option value="MAIN">Main</option>
            <option value="AFFILIATE">Affiliate</option>
          </select>

          <div className="mt-6 flex justify-between items-center">
            <label htmlFor={visibilityInputId}>Redacted</label>

            <YesNoCheckbox
              {...register("visibility")}
              id={visibilityInputId}
              value="REDACTED"
            />
          </div>

          <div className="flex flex-row-reverse gap-4 items-center mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>

            {showCreateAndConfirmButton && (
              <Button
                type="submit"
                disabled={isLoading}
                variant="tertiary"
                name="confirmed"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Speichern und bestätigen
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};
