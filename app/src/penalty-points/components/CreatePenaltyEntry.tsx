"use client";

import Button from "@/common/components/Button";
import { DateTimeInput } from "@/common/components/form/DateTimeInput";
import { NumberInput } from "@/common/components/form/NumberInput";
import { Textarea } from "@/common/components/form/Textarea";
import Modal from "@/common/components/Modal";
import Note from "@/common/components/Note";
import { CitizenInput } from "@/spynet/components/CitizenInput";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createPenaltyEntry } from "../actions/createPenaltyEntry";

type Props = Readonly<{
  className?: string;
}>;

export const CreatePenaltyEntry = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const response = await createPenaltyEntry(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success!);
        setIsOpen(false);
        return response;
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
        return {
          error:
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
          requestPayload: formData,
        };
      }
    },
    null,
  );

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="secondary"
        className={clsx(className)}
        title="Strafpunkte eintragen"
      >
        <span className="hidden md:inline">Strafpunkte eintragen</span>
        {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
        heading={<h2>Strafpunkte eintragen</h2>}
      >
        <form action={formAction}>
          <CitizenInput name="sinisterId" autoFocus />

          <NumberInput
            name="points"
            label="Strafpunkte"
            min={1}
            defaultValue={
              state?.requestPayload?.has("points")
                ? (state.requestPayload.get("points") as string)
                : 1
            }
            required
            className="mt-4"
          />

          <Textarea
            name="reason"
            label="Begründung"
            hint="optional"
            maxLength={512}
            defaultValue={
              state?.requestPayload?.has("reason")
                ? (state.requestPayload.get("reason") as string)
                : ""
            }
          />

          <DateTimeInput
            name="expiresAt"
            label="Verfällt am"
            hint="optional"
            defaultValue={
              state?.requestPayload?.has("expiresAt")
                ? (state.requestPayload.get("expiresAt") as string)
                : ""
            }
          />

          <Button type="submit" disabled={isPending} className="ml-auto mt-4">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>

          {state?.error && (
            <Note type="error" message={state.error} className="mt-4" />
          )}
        </form>
      </Modal>
    </>
  );
};
