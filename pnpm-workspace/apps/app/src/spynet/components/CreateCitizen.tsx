"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";

interface FormValues {
  spectrumId: string;
}

export const CreateCitizen = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spynet/citizen`, {
        method: "POST",
        body: JSON.stringify({
          type: "citizen",
          spectrumId: data.spectrumId,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id: string };
        router.push(`/app/spynet/citizen/${data.id}`);
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
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        title="Neuen Citizen anlegen"
      >
        <FaPlus /> Citizen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Neuen Citizen anlegen</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={inputId}>
            Spectrum ID
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={inputId}
            {...register("spectrumId", { required: true })}
            autoFocus
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
