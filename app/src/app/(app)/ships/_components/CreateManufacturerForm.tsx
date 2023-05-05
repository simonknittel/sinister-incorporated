"use client";

import { type Manufacturer } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface Props {
  className?: string;
}

interface FormValues {
  name: Manufacturer["name"];
}

const CreateManufacturerForm = ({ className }: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/manufacturer", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Successfully created");
        reset();
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
    <div className={clsx(className)}>
      <form className="flex gap-2" onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          className="py-2 px-4 rounded bg-neutral-800 w-full"
          placeholder="Manufacturer name"
          {...register("name", { required: true })}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Add
        </Button>
      </form>
    </div>
  );
};

export default CreateManufacturerForm;
