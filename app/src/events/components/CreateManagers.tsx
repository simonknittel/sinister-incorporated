"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type { Event } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import {
  startTransition,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEventHandler,
} from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createManagers } from "../actions/createManagers";

type Props = Readonly<{
  className?: string;
  event: Event;
}>;

export const CreateManagers = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitIsPending, startSubmitTransition] = useTransition();
  const managerIdsInputId = useId();
  const managerIdsInputRef = useRef<HTMLTextAreaElement>(null);
  const [managerIds, setManagerIds] = useState<string[]>([]);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  const formAction = (formData: FormData) => {
    startSubmitTransition(async () => {
      try {
        const response = await createManagers(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success!);
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

  const handleManagerIdsChange: FormEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    startTransition(() => {
      const value = event.currentTarget.value;
      setManagerIds(
        value
          .split("\n")
          .map((id) => id.trim())
          .filter(Boolean),
      );
    });
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="tertiary"
        className={clsx(props.className)}
        title="Manager hinzufügen"
      >
        <FaPlus />
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Manager hinzufügen</h2>

        <form action={formAction} className="mt-6">
          <input type="hidden" name="eventId" value={props.event.id} />

          {managerIds.map((id, index) => (
            <input key={index} type="hidden" name="managerId[]" value={id} />
          ))}

          <label className="block" htmlFor={managerIdsInputId}>
            Citizen (Sinister ID)
          </label>
          <textarea
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2 disabled:opacity-50 align-baseline h-32"
            name="citizenIds"
            required
            id={managerIdsInputId}
            ref={managerIdsInputRef}
            onChange={handleManagerIdsChange}
            readOnly={"transaction" in props}
            disabled={"transaction" in props}
          />
          <p className="text-xs mt-1">Eine ID pro Zeile, ohne Komma</p>

          <div className="flex flex-col gap-2 mt-4">
            <Button type="submit" disabled={submitIsPending}>
              {submitIsPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSave />
              )}
              Speichern
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
