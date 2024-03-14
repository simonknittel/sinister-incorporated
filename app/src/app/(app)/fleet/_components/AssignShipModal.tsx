"use client";

import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import { flatten } from "lodash";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  data?: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}

interface FormValues {
  variantId: Variant["id"];
  name: string;
}

const AssignShipModal = ({
  isOpen,
  onRequestClose,
  data = [],
}: Readonly<Props>) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const selectId = useId();
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/ship", {
        method: "POST",
        body: JSON.stringify({
          variantId: data.variantId,
          name: data.name,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich hinzugefügt");
        reset();
        onRequestClose();
      } else {
        toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Hinzufügen ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  const options: {
    manufacturer: Manufacturer;
    variants: Variant[];
  }[] = [];

  data
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((manufacturer) => {
      options.push({
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
      });
    });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="w-[480px]"
    >
      <h2 className="text-xl font-bold">Schiff hinzufügen</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="mt-6 block" htmlFor={selectId}>
          Schiff
        </label>

        <select
          id={selectId}
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          {...register("variantId", { required: true })}
          autoFocus
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
          Name
        </label>

        <input
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          id={inputId}
          {...register("name")}
        />

        <p className="mt-2 text-neutral-500">optional</p>

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Hinzufügen
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignShipModal;
