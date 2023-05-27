"use client";

import { type Role } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import ImageSection from "./ImageSection";

interface FormValues {
  name: string;
}

interface Props {
  className?: string;
  role: Role;
}

const Update = ({ className, role }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      name: role.name,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/role/${role.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
        setIsOpen(false);
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
    <>
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className={clsx(className)}
      >
        <FaPen />
        Bearbeiten
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Bearbeiten</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block font-bold" htmlFor={inputId}>
            Name
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={inputId}
            {...register("name", { required: true })}
            autoFocus
          />

          <ImageSection role={role} className="mt-6" />

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Update;
