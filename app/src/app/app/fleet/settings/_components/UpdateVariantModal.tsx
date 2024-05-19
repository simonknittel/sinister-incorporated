import { type Variant } from "@prisma/client";
import { useId, useTransition } from "react";
import { toast } from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import { updateVariant } from "../../../../../lib/serverActions/variant";
import { api } from "../../../../../trpc/react";
import Button from "../../../../_components/Button";
import Modal from "../../../../_components/Modal";

type Props = Readonly<{
  onRequestClose: () => void;
  variant: Pick<Variant, "id">;
}>;

export const UpdateVariantModal = ({ onRequestClose, variant }: Props) => {
  const _variant = api.variant.getById.useQuery(
    { id: variant.id },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const [isPending, startTransition] = useTransition();
  const nameId = useId();
  const statusId = useId();

  const _action = (formData: FormData) => {
    startTransition(async () => {
      try {
        const name = formData.get("name")?.toString();
        if (!name) {
          toast.error("Das Feld kann nicht leer sein.");
          return;
        }

        const status = formData.get("status")?.toString();
        if (!status) {
          toast.error("Das Feld kann nicht leer sein.");
          return;
        }

        const response = await updateVariant({
          id: variant.id,
          name,
          status,
        });

        if (response.status === 200) {
          toast.success("Erfolgreich gespeichert");
          onRequestClose();
        } else {
          toast.error(
            response.errorMessage ||
              "Beim Speichern ist ein Fehler aufgetreten.",
          );
        }
      } catch (error) {
        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
        console.error(error);
      }
    });
  };

  return (
    <Modal isOpen={true} onRequestClose={onRequestClose} className="w-[480px]">
      <h2 className="text-xl font-bold">Variante bearbeiten</h2>

      <form action={_action}>
        <label className="mt-6 block" htmlFor={nameId}>
          Name
        </label>

        {_variant.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 h-10 animate-pulse " />
        ) : (
          <input
            id={nameId}
            name="name"
            type="text"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            required
            autoFocus
            defaultValue={_variant.data?.name}
          />
        )}

        <label className="mt-6 block" htmlFor={statusId}>
          Status
        </label>

        {_variant.isFetching ? (
          <div className="rounded bg-neutral-900 mt-2 h-10 animate-pulse " />
        ) : (
          <select
            id={statusId}
            name="status"
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={_variant.data?.status}
            required
          >
            <option value="FLIGHT_READY">Flight ready</option>
            <option value="NOT_FLIGHT_READY">Nicht flight ready</option>
          </select>
        )}

        <small className="text-neutral-500">optional</small>

        <div className="flex justify-end mt-8">
          <Button disabled={isPending || _variant.isFetching}>
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </div>
      </form>
    </Modal>
  );
};
