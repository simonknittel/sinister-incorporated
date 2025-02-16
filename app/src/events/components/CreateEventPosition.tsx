"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type { DiscordEvent } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createEventPosition } from "../actions/createEventPosition";

type Props = Readonly<{
  className?: string;
  event: DiscordEvent;
}>;

export const CreateEventPosition = ({ className, event }: Props) => {
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
        const response = await createEventPosition(formData);

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
        title="Position hinzufügen"
      >
        <span className="hidden md:inline">Position hinzufügen</span>
        {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Position hinzufügen</h2>

        <form action={formAction} className="mt-6">
          <input type="hidden" name="eventId" value={event.id} />

          <label className="block">Name</label>
          <input
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="name"
            required
            type="text"
            maxLength={256}
          />

          <label className="block mt-4">Beschreibung (optional)</label>
          <textarea
            className="p-2 rounded bg-neutral-900 w-full h-32 mt-2"
            name="description"
            maxLength={512}
          />

          {/* TODO: Add input for selecting the variant */}

          {/* TODO: Add input for selecting the roles */}

          <Button type="submit" disabled={isPending} className="ml-auto mt-8">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </form>
      </Modal>
    </>
  );
};
