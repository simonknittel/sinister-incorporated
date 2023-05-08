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
}

const AssignShipModal = ({ isOpen, onRequestClose, data = [] }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const id = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/fleet-ownership", {
        method: "POST",
        body: JSON.stringify({
          variantId: data.variantId,
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
                .map((variant) => variant)
            )
        ),
      });
    });

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="w-[480px]"
    >
      <h2 className="text-xl font-bold">Schiff auswählen</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="mt-6 block" htmlFor={id}>
          Schiff
        </label>

        <select
          id={id}
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
