"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaChevronDown, FaSave } from "react-icons/fa";
import Button from "~/app/_components/Button";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";

interface FormValues {
  values: string[];
}

interface Props {
  confirmationStates: string[];
}

const ConfirmationStateFilterButton = ({ confirmationStates }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button onClick={() => setIsOpen((value) => !value)} variant="secondary">
        <FaChevronDown /> Bestätigungsstatus
      </Button>

      {isOpen && (
        <Inner
          onRequestClose={() => setIsOpen(false)}
          confirmationStates={confirmationStates}
        />
      )}
    </div>
  );
};

export default ConfirmationStateFilterButton;

interface InnerProps {
  onRequestClose?: () => void;
  confirmationStates: string[];
}

const Inner = ({ onRequestClose, confirmationStates }: InnerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { register, handleSubmit } = useForm<FormValues>({
    defaultValues: {
      values: (searchParams.get("filters")?.split(",") || []).filter(
        (filter) => {
          if (filter.startsWith("confirmation-")) return true;
          return false;
        },
      ),
    },
  });

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());

    let filters = newSearchParams.get("filters")?.split(",") || [];
    filters = filters.filter((filter) => {
      if (filter === "") return false;
      if (filter.startsWith("confirmation-")) return false;
      return true;
    });

    data.values.forEach((filter) => {
      filters.push(filter);
    });

    newSearchParams.set("filters", filters.join(","));

    router.push(`/spynet/notes?${newSearchParams.toString()}`);

    onRequestClose?.();
  };

  return (
    <form
      className={
        "absolute top-[calc(100%+.5rem)] left-0 flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800 border border-neutral-900 z-10"
      }
      onSubmit={handleSubmit(onSubmit)}
    >
      {confirmationStates.includes("unconfirmed") && (
        <div className="flex justify-between items-center w-full gap-4">
          <label
            className="whitespace-nowrap cursor-pointer"
            htmlFor="confirmation-unconfirmed"
          >
            Unbestätigt
          </label>
          <YesNoCheckbox
            register={register("values")}
            id="confirmation-unconfirmed"
            value="confirmation-unconfirmed"
          />
        </div>
      )}

      {confirmationStates.includes("confirmed") && (
        <div className="flex justify-between items-center w-full gap-4">
          <label
            className="whitespace-nowrap cursor-pointer"
            htmlFor="confirmation-confirmed"
          >
            Bestätigt
          </label>
          <YesNoCheckbox
            register={register("values")}
            id="confirmation-confirmed"
            value="confirmation-confirmed"
          />
        </div>
      )}

      {confirmationStates.includes("falseReport") && (
        <div className="flex justify-between items-center w-full gap-4">
          <label
            className="whitespace-nowrap cursor-pointer"
            htmlFor="confirmation-false-report"
          >
            Falschmeldung
          </label>
          <YesNoCheckbox
            register={register("values")}
            id="confirmation-false-report"
            value="confirmation-false-report"
          />
        </div>
      )}

      <div className="flex justify-end w-full">
        <Button variant="primary">
          <FaSave /> Speichern
        </Button>
      </div>
    </form>
  );
};
