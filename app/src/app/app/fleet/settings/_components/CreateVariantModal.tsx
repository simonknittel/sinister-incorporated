import { type Manufacturer, type Series } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { api } from "../../../../../trpc/react";
import Button from "../../../../_components/Button";
import Modal from "../../../../_components/Modal";

type Props = Readonly<{
  onRequestClose: () => void;
  manufacturerId: Manufacturer["id"];
  seriesId: Series["id"];
}>;

export const CreateVariantModal = ({
  onRequestClose,
  manufacturerId,
  seriesId,
}: Props) => {
  const router = useRouter();
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      console.log(seriesId, event.target.seriesId);
      const response = await fetch("/api/variant", {
        method: "POST",
        body: JSON.stringify({
          seriesId: event.target.seriesId.value,
          name: event.target.name.value,
          status: event.target.status.value,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
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

      <form onSubmit={(e) => handleSubmit(e)}>
        <label className="mt-6 block" htmlFor="manufacturerId">
          Hersteller
        </label>

        {manufacturer.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <select
            autoFocus={!Boolean(manufacturerId)}
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={manufacturerId}
            disabled={Boolean(manufacturerId)}
            id="manufacturerId"
            name="manufacturerId"
          >
            <option value={manufacturerId}>
              {manufacturer.data?.name || "???"}
            </option>
          </select>
        )}

        <label className="block mt-4" htmlFor="seriesId">
          Serie
        </label>

        {series.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <select
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={seriesId}
            disabled={Boolean(seriesId)}
            id="seriesId"
            name="seriesId"
            required
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

        {series.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <input
            autoFocus={Boolean(manufacturerId)}
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={
              series.data?.find((singleSeries) => singleSeries.id === seriesId)
                ?.name || ""
            }
            id="name"
            name="name"
            required
            type="text"
          />
        )}

        <label className="mt-6 block" htmlFor="status">
          Status
        </label>

        <select
          id="status"
          className="p-2 rounded bg-neutral-900 w-full mt-2"
          name="status"
        >
          <option value="FLIGHT_READY">Flight ready</option>
          <option value="NOT_FLIGHT_READY">Nicht flight ready</option>
        </select>

        <small className="text-neutral-500">optional</small>

        <div className="flex justify-end mt-8">
          <Button
            type="submit"
            disabled={isLoading || manufacturer.isFetching || series.isFetching}
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </div>
      </form>
    </Modal>
  );
};
