"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSearch, FaSpinner } from "react-icons/fa";
import Button from "~/app/_components/Button";

interface FormValues {
  query: string;
}

const Search = () => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spynet/search`, {
        method: "POST",
        body: JSON.stringify({
          query: data.query,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as { id: string };
        router.push(`/spynet/e/${data.id}`);
        reset();
      } else {
        toast.error("Bei der Suche ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Bei der Suche ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full">
        <input
          className="p-2 rounded-l bg-neutral-900 flex-1"
          id={inputId}
          {...register("query", { required: true })}
          placeholder="Handle, Spectrum ID oder Sinister ID ..."
          autoFocus
        />

        <Button type="submit" disabled={isLoading} className="rounded-l-none">
          {isLoading ? <FaSpinner className="animate-spin" /> : <FaSearch />}
        </Button>
      </form>
    </>
  );
};

export default Search;
