import { Button2 } from "@/common/components/Button2";
import Modal from "@/common/components/Modal";
import { type Operation } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";

interface FormValues {
  title: string;
}

interface Props {
  readonly isOpen: boolean;
  readonly onRequestClose: () => void;
}

export const CreateOperationModal = ({ isOpen, onRequestClose }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/operation", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as Operation;
        router.push(`/app/operations/${data.id}`);
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
      heading={<h2>Neue Operation anlegen</h2>}
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
            Anlegen
          </Button2>
        </div>
      </form>
    </Modal>
  );
};
