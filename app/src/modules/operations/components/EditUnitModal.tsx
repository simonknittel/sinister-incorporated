"use client";

import { Button2 } from "@/modules/common/components/Button2";
import Modal from "@/modules/common/components/Modal";
import { type OperationUnit } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  unit: OperationUnit;
}

interface FormValues {
  title: string;
}

const EditUnitModal = ({ isOpen, onRequestClose, unit }: Readonly<Props>) => {
  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      title: unit.title,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const selectId = useId();
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/operation-unit/${unit.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: data.title,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich bearbeitet");
        onRequestClose();
      } else {
        toast.error("Beim Bearbeiten ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Bearbeiten ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="w-[480px]"
      heading={<h2>Unit bearbeiten</h2>}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block" htmlFor={selectId}>
          Typ
        </label>

        <select
          className="p-2 rounded-secondary bg-neutral-900 w-full mt-2"
          id={selectId}
          disabled
          defaultValue="squadron"
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
          className="p-2 rounded-secondary bg-neutral-900 w-full mt-2"
          id={inputId}
          {...register("title", { required: true })}
          autoFocus
        />

        <div className="flex justify-end mt-8">
          <Button2 type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button2>
        </div>
      </form>
    </Modal>
  );
};

export default EditUnitModal;
