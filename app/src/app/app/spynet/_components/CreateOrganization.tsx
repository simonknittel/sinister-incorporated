"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import Button from "../../../_components/Button";
import Modal from "../../../_components/Modal";

interface FormValues {
  spectrumId: string;
  name: string;
}

export const CreateOrganization = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const spectrumIdInputId = useId();
  const nameInputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spynet/organization`, {
        method: "POST",
        body: JSON.stringify({
          spectrumId: data.spectrumId,
          name: data.name,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id: string };
        router.push(`/app/spynet/organization/${data.id}`);
        reset();
        setIsOpen(false);
      } else {
        toast.error("Beim Anlegen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Anlegen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Button variant="tertiary" onClick={() => setIsOpen(true)}>
        <FaPlus /> Neue Organisation
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Neue Organisation</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={spectrumIdInputId}>
            Spectrum ID
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={spectrumIdInputId}
            {...register("spectrumId", { required: true })}
            autoFocus
          />

          <label className="mt-4 block" htmlFor={nameInputId}>
            Name
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={nameInputId}
            {...register("name", { required: true })}
          />

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Anlegen
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
