import { type Series, type Variant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { api } from "../../../../../trpc/react";
import Button from "../../../../_components/Button";
import Modal from "../../../../_components/Modal";

type Props = Readonly<{
  onRequestClose: () => void;
  manufacturerId: Series["id"];
  seriesId: Series["id"];
}>;

interface FormValues {
  seriesId: Series["id"];
  name: Variant["name"];
}

export const CreateVariantModal = ({
  onRequestClose,
  manufacturerId,
  seriesId,
}: Props) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      seriesId,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const manufacturer = api.manufacturer.getById.useQuery(
    {
      id: manufacturerId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const series = api.manufacturer.getSeriesByManufacturerId.useQuery(
    {
      manufacturerId,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/variant", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          seriesId: data.seriesId,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
        reset();
        onRequestClose();
      } else {
        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <Modal isOpen={true} onRequestClose={onRequestClose} className="w-[480px]">
      <h2 className="text-xl font-bold">Variante anlegen</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <label className="mt-6 block" htmlFor="name">
          Hersteller
        </label>

        {manufacturer.isFetching ? (
          <div className="p-2 rounded bg-neutral-900 w-full mt-2 animate-pulse h-10" />
        ) : (
          <div className="p-2 rounded bg-neutral-900 w-full mt-2">
            {manufacturer.data?.name || "???"}
          </div>
        )}

        <label className="block mt-4" htmlFor="seriesId">
          Serie
        </label>

        {series.isFetching ? (
          <div className="p-2 rounded bg-neutral-900 w-full mt-2 animate-pulse h-10" />
        ) : (
          <select
            id="seriesId"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            {...register("seriesId", { required: true })}
            defaultValue={seriesId}
            autoFocus={Boolean(seriesId)}
          >
            {series.data?.map((singleSeries) => (
              <option key={singleSeries.id} value={singleSeries.id}>
                {singleSeries.name}
              </option>
            ))}
          </select>
        )}

        <label className="mt-6 block" htmlFor="name">
          Name
        </label>

        <input
          id="name"
          type="text"
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          {...register("name", { required: true })}
          autoFocus
        />

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Add
          </Button>
        </div>
      </form>
    </Modal>
  );
};
