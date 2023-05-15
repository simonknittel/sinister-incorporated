"use client";

import { type EntityLog } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";

interface Props {
  log: EntityLog;
}

interface FormValues {
  newSecurityLevel: string;
}

const ChangeSecurityLevel = ({ log }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const selectId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/spynet/${log.entityId}/log/${log.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            securityLevel: data.newSecurityLevel,
          }),
        }
      );

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich geändert");
        reset();
        setIsOpen(false);
      } else {
        toast.error("Beim Ändern ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Ändern ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        title="Sicherheitsstufe ändern"
        type="button"
        className="text-sinister-red-500 hover:text-sinister-red-300 w-4 h-4"
      >
        <FaPen />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Sicherheitsstufe ändern</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={selectId}>
            Sicherheitsstufe
          </label>

          <select
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={selectId}
            {...register("newSecurityLevel")}
          >
            <option value="squadron">1</option>
            <option value="squadron">2</option>
            <option value="squadron">3</option>
          </select>

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Ändern
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default ChangeSecurityLevel;
