"use client";

import { type Manufacturer, type Series } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  manufacturers: Manufacturer[];
}

interface FormValues {
  manufacturerId: Manufacturer["id"];
  name: Series["name"];
}

const AddSeriesModal = ({ isOpen, onRequestClose, manufacturers }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/series", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          manufacturerId: data.manufacturerId,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Successfully created");
        reset();
        onRequestClose();
      } else {
        toast.error("There has been an error while creating.");
      }
    } catch (error) {
      toast.error("There has been an error while creating.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      className="w-[480px]"
    >
      <h2 className="text-xl font-bold">Add new series</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="block mt-6" htmlFor="manufacturer_id">
          Manufacturer
        </label>

        <select
          id="manufacturer_id"
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          {...register("manufacturerId", { required: true })}
          autoFocus
        >
          {manufacturers.map((manufacturer) => (
            <option key={manufacturer.id} value={manufacturer.id}>
              {manufacturer.name}
            </option>
          ))}
        </select>

        <label className="block mt-4" htmlFor="name">
          Name
        </label>

        <input
          id="name"
          type="text"
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          {...register("name", { required: true })}
        />

        <div className="flex justify-end mt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Add
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSeriesModal;
