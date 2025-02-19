"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createPenaltyEntry } from "../actions/createPenaltyEntry";

type Props = Readonly<{
  className?: string;
}>;

export const CreatePenaltyEntry = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await createPenaltyEntry(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success);
        setIsOpen(false);
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
      >
        <h2 className="text-xl font-bold">Strafpunkte eintragen</h2>

        <form action={formAction} className="mt-6">
          <label className="block">Citizen (Sinister ID)</label>
          <input
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="sinisterId"
            required
            type="text"
          />

          <label className="block mt-4">Strafpunkte</label>
          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="points"
            required
            type="number"
            min={1}
          />

          <label className="block mt-4">Begründung (optional)</label>
          <textarea
            className="p-2 rounded bg-neutral-900 w-full h-32 mt-2"
            name="reason"
            maxLength={512}
          />

          <label className="block mt-4">Verfällt am (optional)</label>
          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="expiresAt"
            type="datetime-local"
          />

          <Button type="submit" disabled={isPending} className="ml-auto mt-8">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </form>
      </Modal>
    </>
  );
};
