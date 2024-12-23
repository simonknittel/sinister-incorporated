"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import { flatten } from "lodash";
import { useId, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createShipAction } from "../actions/createShipAction";

type Props = Readonly<{
  className?: string;
  data?: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}>;

export const AssignShip = ({ className, data = [] }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectId = useId();
  const inputId = useId();
  const [isPending, startTransition] = useTransition();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await createShipAction(formData);

        if (response.success) {
          toast.success(response.success);
          setIsOpen(false);
        } else {
          // @ts-expect-error Don't know why this is an issue
          toast.error(response.error);
        }
      } catch (error) {
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  const options: {
    manufacturer: Manufacturer;
    variants: Variant[];
  }[] = data
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((manufacturer) => {
      return {
        manufacturer,
        variants: flatten(
          manufacturer.series
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((series) =>
              series.variants
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((variant) => variant),
            ),
        ),
      };
    });

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        className={className}
      >
        Hinzufügen <FaPlus />
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Schiff hinzufügen</h2>

        <form action={formAction}>
          <label className="mt-6 block" htmlFor={selectId}>
            Schiff
          </label>
          <select
            name="variantId"
            autoFocus
            id={selectId}
            className="p-2 rounded bg-neutral-900 w-full mt-2"
          >
            {options.map((option) => (
              <optgroup
                key={option.manufacturer.id}
                label={option.manufacturer.name}
              >
                {option.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <label className="mt-4 block" htmlFor={inputId}>
            Schiffsname
          </label>
          <input
            name="name"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            id={inputId}
          />
          <p className="mt-2 text-neutral-500">optional</p>

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isPending}>
              {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Hinzufügen
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
