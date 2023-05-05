"use client";

import { type Manufacturer, type Series } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/components/Button";
import Modal from "~/components/Modal";

interface Props {
  isOpen: boolean;
  onRequestClose: () => void;
  manufacturerId: Manufacturer["id"];
}

interface FormValues {
  name: Series["name"];
}

const AddSeriesModal = ({ isOpen, onRequestClose, manufacturerId }: Props) => {
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
          manufacturerId,
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
        <input
          type="text"
          className="p-2 rounded bg-neutral-900 w-full mt-4"
          placeholder="Name"
          {...register("name", { required: true })}
          autoFocus
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
