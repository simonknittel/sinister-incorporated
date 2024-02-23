"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { FiRefreshCcw } from "react-icons/fi";
import { RiBardFill } from "react-icons/ri";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import { api } from "~/trpc/react";

interface FormValues {
  name: string;
}

interface Props {
  className?: string;
}

const Create = ({ className }: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);
  const suggestions = api.ai.getRoleNameSuggestions.useQuery();

  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

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
      <Button
        variant="secondary"
        onClick={() => setIsOpen(true)}
        className={clsx(className)}
      >
        <FaPlus />
        Hinzufügen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Hinzufügen</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={inputId}>
            Name
          </label>

          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={inputId}
            {...register("name", { required: true })}
            autoFocus
          />

          <p className="flex items-center font-bold gap-2 mt-4">
            <RiBardFill /> Vorschläge
          </p>

          <div className="flex gap-2 flex-wrap mt-2">
            {suggestions.data ? (
              <>
                {suggestions.data.map((suggestion) => (
                  <button
                    key={suggestion}
                    className={clsx(
                      "px-2 py-1 rounded bg-neutral-700 flex gap-2 items-center whitespace-nowrap hover:bg-neutral-600 transition-colors",
                      {
                        "animate-pulse": suggestions.isFetching,
                      },
                    )}
                    disabled={suggestions.isFetching}
                  >
                    {suggestion}
                  </button>
                ))}

                <button
                  className="enabled:hover:bg-neutral-700 text-neutral-500 enabled:hover:text-white px-2 py-1 rounded transition-colors whitespace-nowrap flex gap-2 items-center"
                  disabled={suggestions.isFetching}
                  type="button"
                  onClick={() => suggestions.refetch()}
                >
                  <FiRefreshCcw
                    className={clsx({
                      "animate-spin": suggestions.isFetching,
                    })}
                  />
                  Neu laden
                </button>
              </>
            ) : (
              <>
                <div className="w-[8rem] h-8 rounded bg-neutral-700 animate-pulse" />
                <div className="w-[12rem] h-8 rounded bg-neutral-700 animate-pulse" />
                <div className="w-[6rem] h-8 rounded bg-neutral-700 animate-pulse" />
              </>
            )}
          </div>

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

export default Create;
