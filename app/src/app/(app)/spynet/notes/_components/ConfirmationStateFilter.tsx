"use client";

import * as Popover from "@radix-ui/react-popover";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

const ConfirmationStateFilter = ({ confirmationStates }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

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

    router.push(`${pathname}?${newSearchParams.toString()}`);

    setIsOpen(false);
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary">
          <FaChevronDown /> Bestätigungsstatus
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content sideOffset={4}>
          <form
            className={
              "flex flex-col items-start gap-2 px-4 py-2 rounded bg-neutral-800"
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

          <Popover.Arrow className="fill-neutral-800" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default ConfirmationStateFilter;
