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

const AddHandle = ({ entity }: Props) => {
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
          type: "handle",
          content: data.content,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
        reset();
      } else {
        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex mt-4">
      <input
        className="p-2 rounded-l bg-neutral-900 flex-1"
        id={inputId}
        {...register("content", { required: true })}
        autoFocus
        placeholder="Handle speichern ..."
      />

      <Button
        type="submit"
        disabled={isLoading}
        className="rounded-l-none"
        title="Speichern"
      >
        {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
      </Button>
    </form>
  );
};

export default AddHandle;
