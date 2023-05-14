"use client";

import { type Entity } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  entity: Entity;
}

interface FormValues {
  content: string;
}

const AddNote = ({ entity }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spynet/entity/${entity.id}/log`, {
        method: "POST",
        body: JSON.stringify({
          type: "note",
          content: data.content,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich hinzugefügt");
        reset();
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex mt-4">
      <textarea
        className="p-2 rounded-l bg-neutral-800 flex-1"
        id={inputId}
        {...register("content", { required: true })}
        autoFocus
        placeholder="Notiz hinzufügen ..."
      />

      <div>
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-l-none h-full"
          title="Hinzufügen"
        >
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
        </Button>
      </div>
    </form>
  );
};

export default AddNote;
