"use client";

import Button from "@/common/components/Button";
import { NumberInput } from "@/common/components/form/NumberInput";
import { Textarea } from "@/common/components/form/Textarea";
import Modal from "@/common/components/Modal";
import Note from "@/common/components/Note";
import { CitizenInput } from "@/spynet/components/CitizenInput";
import type { Event, SilcTransaction } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import { FaPen, FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createSilcTransaction } from "../actions/createSilcTransaction";
import { updateSilcTransaction } from "../actions/updateSilcTransaction";

type BaseProps = Readonly<{
  className?: string;
}>;

type CreateProps = Readonly<{
  event: Event;
}>;

type UpdateProps = Readonly<{
  transaction?: SilcTransaction;
}>;

type Props = (CreateProps | UpdateProps) & BaseProps;

export const CreateOrUpdateSilcTransaction = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const response =
          "transaction" in props
            ? await updateSilcTransaction(formData)
            : await createSilcTransaction(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success!);
        if (formData.has("createAnother")) {
          return response;
        }

        setIsOpen(false);
        return response;
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
        return {
          error:
            "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
          requestPayload: formData,
        };
      }
    },
    null,
  );

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {"transaction" in props ? (
        <Button
          onClick={handleClick}
          variant="tertiary"
          className={clsx("px-2 w-auto", props.className)}
          title="Transaktion bearbeiten"
          iconOnly
        >
          <FaPen />
        </Button>
      ) : (
        <Button
          onClick={handleClick}
          variant="secondary"
          className={clsx(props.className)}
          title="Transaktion erstellen"
        >
          <span className="hidden md:inline">Transaktion erstellen</span>
          <FaPlus />
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
        heading={
          <h2>
            {"transaction" in props
              ? "Transaktion bearbeiten"
              : "Transaktion erstellen"}
          </h2>
        }
      >
        <form action={formAction}>
          {"transaction" in props && props.transaction && (
            <input
              type="hidden"
              name="transactionId"
              value={props.transaction.id}
            />
          )}

          {"transaction" in props && props.transaction ? (
            <CitizenInput
              name="receiverId"
              defaultValue={props.transaction.receiverId}
              disabled
              autofocus
            />
          ) : (
            <CitizenInput name="receiverId" multiple autofocus />
          )}

          <NumberInput
            name="value"
            label="Wert"
            hint="Kann negativ sein, um Guthaben zu entziehen."
            required
            defaultValue={
              state?.requestPayload?.has("value")
                ? (state.requestPayload.get("value") as string)
                : ("transaction" in props && props.transaction?.value) || 1
            }
          />

          <Textarea
            name="description"
            label="Beschreibung"
            hint="optional"
            maxLength={512}
            defaultValue={
              state?.requestPayload?.has("description")
                ? (state.requestPayload.get("description") as string)
                : ("transaction" in props && props.transaction?.description) ||
                  ""
            }
            className="mt-4"
          />

          <div className="flex flex-col gap-2 mt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>

            {!("transaction" in props) && (
              <Button
                type="submit"
                disabled={isPending}
                variant="tertiary"
                name="createAnother"
              >
                {isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Speichern und weitere Transaktion erstellen
              </Button>
            )}
          </div>

          {state?.error && (
            <Note type="error" message={state.error} className="mt-4" />
          )}
        </form>
      </Modal>
    </>
  );
};
