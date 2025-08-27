"use client";

import { Button2 } from "@/common/components/Button2";
import { TextInput } from "@/common/components/form/TextInput";
import Modal from "@/common/components/Modal";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { Suggestions } from "./Suggestions";

interface FormValues {
  name: string;
}

interface Props {
  className?: string;
  enableSuggestions?: boolean;
}

export const Create = ({ className, enableSuggestions }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/role`, {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich hinzugefügt");
        reset();
        setIsOpen(false);
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
    <>
      <Button2 onClick={() => setIsOpen(true)} className={clsx(className)}>
        <FaPlus />
        Neue Rolle
      </Button2>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
        heading={<h2>Neue Rolle</h2>}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Name"
            className="mt-2"
            {...register("name", { required: true })}
            autoFocus
          />

          {enableSuggestions && (
            <Suggestions
              className="mt-4"
              onClick={(roleName) => setValue("name", roleName)}
            />
          )}

          <div className="flex justify-end mt-8">
            <Button2 type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button2>
          </div>
        </form>
      </Modal>
    </>
  );
};
