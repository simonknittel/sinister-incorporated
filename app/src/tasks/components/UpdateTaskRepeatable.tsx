"use client";

import Button from "@/common/components/Button";
import { NumberInput } from "@/common/components/form/NumberInput";
import Modal from "@/common/components/Modal";
import Note from "@/common/components/Note";
import { type Task, type TaskAssignment } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import { updateTaskRepeatable } from "../actions/updateTaskRepeatable";

type Props = Readonly<{
  className?: string;
  task: Task & {
    assignments: TaskAssignment[];
  };
}>;

export const UpdateTaskRepeatable = ({ className, task }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const response = await updateTaskRepeatable(formData);

        if ("error" in response) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success);
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
      <button
        onClick={handleClick}
        type="button"
        title="Bearbeiten"
        className={clsx(
          "text-sinister-red-500 hover:text-sinister-red-300",
          className,
        )}
      >
        <FaPen />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
        heading={<h2>Bearbeiten</h2>}
      >
        <form action={formAction}>
          <input type="hidden" name="id" value={task.id} />

          <NumberInput
            name="repeatable"
            label="Wie häufig kann dieser Task abgeschlossen werden?"
            defaultValue={
              state &&
              "requestPayload" in state &&
              state.requestPayload.has("repeatable")
                ? (state.requestPayload.get("repeatable") as string)
                : task.repeatable || 1
            }
            required
            min={1}
          />

          <Button type="submit" disabled={isPending} className="mt-4 ml-auto">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>

          {state && "error" in state && (
            <Note type="error" message={state.error} className="mt-4" />
          )}
        </form>
      </Modal>
    </>
  );
};
