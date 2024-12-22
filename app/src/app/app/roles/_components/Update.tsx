"use client";

import { useAction } from "@/common/components/Actions";
import Button from "@/common/components/Button";
import { ImageUpload } from "@/common/components/ImageUpload";
import Modal from "@/common/components/Modal";
import { type Role } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";

interface FormValues {
  name: string;
}

interface Props {
  className?: string;
  role: Role;
}

const Update = ({ className, role }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);
  const action = useAction();

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
        action.setIsOpen(false);
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
        variant="tertiary"
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

          <label className="mt-6 block font-bold">Bild</label>

          <ImageUpload
            resourceType="role"
            resource={role}
            width={128}
            height={128}
            className={clsx(
              "mt-2 size-32 border border-neutral-700 hover:border-neutral-500 text-neutral-500 hover:text-neutral-300 transition-colors group rounded",
              {
                "after:content-['Bild_hochladen'] flex items-center justify-center":
                  !role.imageId,
              },
            )}
            imageClassName="size-32"
            pendingClassName="size-32"
          />

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
