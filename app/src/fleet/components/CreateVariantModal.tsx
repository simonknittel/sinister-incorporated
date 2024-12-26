import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { api } from "@/trpc/react";
import { type Manufacturer, type Series } from "@prisma/client";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { createVariant } from "../actions/createVariant";

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
  const [isPending, startTransition] = useTransition();
  const nameField = useId();

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

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = await createVariant(formData);

        if (response.success) {
          toast.success(response.success);
          onRequestClose();
        } else {
          toast.error(response.error);
          console.error(response.error);
        }
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  return (
    <Modal isOpen={true} onRequestClose={onRequestClose} className="w-[480px]">
      <h2 className="text-xl font-bold">Variante anlegen</h2>

      <form action={formAction}>
        <label className="mt-6 block">Hersteller</label>

        {manufacturer.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <>
            <p className="p-2 rounded bg-neutral-900 w-full mt-2 opacity-50">
              {manufacturer.data?.name || "???"}
            </p>
            <input
              type="hidden"
              defaultValue={manufacturerId}
              name="manufacturerId"
            />
          </>
        )}

        <label className="block mt-4">Serie</label>

        {series.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <>
            <p className="p-2 rounded bg-neutral-900 w-full mt-2 opacity-50">
              {series.data?.find((series) => series.id === seriesId)?.name ||
                "???"}
            </p>
            <input type="hidden" defaultValue={seriesId} name="seriesId" />
          </>
        )}

        <label className="mt-6 block" htmlFor={nameField}>
          Name
        </label>

        {series.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 animate-pulse h-10" />
        ) : (
          <input
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={
              series.data?.find((singleSeries) => singleSeries.id === seriesId)
                ?.name || ""
            }
            id={nameField}
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
            disabled={isPending || manufacturer.isFetching || series.isFetching}
          >
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </div>
      </form>
    </Modal>
  );
};
