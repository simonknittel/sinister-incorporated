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
  parentUnit: OperationUnit;
}

interface FormValues {
  title: string;
}

const CreateUnitModal = ({
  isOpen,
  onRequestClose,
  parentUnit,
}: Readonly<Props>) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/operation-unit", {
        method: "POST",
        body: JSON.stringify({
          operationId: parentUnit.operationId,
          parentUnitId: parentUnit.id,
          title: data.title,
          type: "squadron-flight",
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
      heading={<h2>Flight hinzufügen</h2>}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block" htmlFor={inputId}>
          Titel
        </label>

        <input
          className="p-2 rounded-secondary bg-neutral-900 w-full mt-2"
          id={inputId}
          {...register("title")}
          autoFocus
        />

        <div className="flex justify-end mt-8">
          <Button2 type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Hinzufügen
          </Button2>
        </div>
      </form>
    </Modal>
  );
};

export default CreateUnitModal;
