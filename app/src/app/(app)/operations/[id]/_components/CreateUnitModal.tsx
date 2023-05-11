"use client";

import { type Operation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  operation: Operation;
}

interface FormValues {
  title: string;
  type: string;
}

const CreateUnitModal = ({ isOpen, onRequestClose, operation }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const selectId = useId();
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/operation-unit", {
        method: "POST",
        body: JSON.stringify({
          operationId: operation.id,
          title: data.title,
          type: data.type,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich hinzugefügt");
        reset();
        onRequestClose();
      } else {
        toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="w-[480px]"
    >
      <h2 className="text-xl font-bold">Unit hinzufügen</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="mt-6 block" htmlFor={selectId}>
          Typ
        </label>

        <select
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          id={selectId}
          {...register("type")}
        >
          <option value="squadron">Squadron</option>

          <option value="squad" disabled>
            Squad
          </option>

          <option value="other" disabled>
            Sonstiges
          </option>
        </select>

        <label className="mt-4 block" htmlFor={inputId}>
          Titel
        </label>

        <input
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          id={inputId}
          {...register("title")}
          autoFocus
        />

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Hinzufügen
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUnitModal;
