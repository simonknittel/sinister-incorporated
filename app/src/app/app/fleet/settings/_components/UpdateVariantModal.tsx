import { type Variant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { api } from "../../../../../trpc/react";
import Button from "../../../../_components/Button";
import Modal from "../../../../_components/Modal";

type Props = Readonly<{
  onRequestClose: () => void;
  variant: Pick<Variant, "id">;
}>;

export const UpdateVariantModal = ({ onRequestClose, variant }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const _variant = api.variant.getById.useQuery(
    { id: variant.id },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/variant/${variant.id}`, {
        method: "PATCH",
        body: JSON.stringify({
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
      <h2 className="text-xl font-bold">Variante bearbeiten</h2>

      <form onSubmit={(e) => handleSubmit(e)}>
        <label className="mt-6 block" htmlFor="name">
          Name
        </label>

        {_variant.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 h-10 animate-pulse " />
        ) : (
          <input
            id="name"
            type="text"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            required
            autoFocus
            defaultValue={_variant.data?.name}
          />
        )}

        <label className="mt-6 block" htmlFor="status">
          Status
        </label>

        {_variant.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 h-10 animate-pulse " />
        ) : (
          <select
            id="status"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={_variant.data?.status}
          >
            <option value="FLIGHT_READY">Flight ready</option>
            <option value="NOT_FLIGHT_READY">Nicht flight ready</option>
          </select>
        )}

        <small className="text-neutral-500">optional</small>

        <div className="flex justify-end mt-8">
          <Button type="submit" disabled={isLoading || _variant.isFetching}>
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </div>
      </form>
    </Modal>
  );
};
