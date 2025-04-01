"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import Note from "@/common/components/Note";
import { CitizenInput } from "@/spynet/components/CitizenInput";
import type { Event, SilcTransaction } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useId, useRef, useState } from "react";
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
          receiverIdsInputRef.current?.focus();
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
  const valueInputId = useId();
  const descriptionInputId = useId();
  const receiverIdsInputRef = useRef<HTMLTextAreaElement>(null);

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
            />
          ) : (
            <CitizenInput name="receiverId" multiple />
          )}

          <label className="block mt-4" htmlFor={valueInputId}>
            Wert
          </label>
          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="value"
            required
            type="number"
            defaultValue={
              state?.requestPayload?.has("value")
                ? (state.requestPayload.get("value") as string)
                : ("transaction" in props && props.transaction?.value) || 1
            }
            id={valueInputId}
          />
          <p className="text-xs mt-1">
            Kann negativ sein, um Guthaben zu entziehen.
          </p>

          <label className="block mt-4" htmlFor={descriptionInputId}>
            Beschreibung
          </label>
          <textarea
            className="p-2 rounded bg-neutral-900 w-full h-32 mt-2 align-middle"
            name="description"
            maxLength={512}
            defaultValue={
              state?.requestPayload?.has("description")
                ? (state.requestPayload.get("description") as string)
                : ("transaction" in props && props.transaction?.description) ||
                  ""
            }
            id={descriptionInputId}
          />
          <p className="text-xs mt-1">optional</p>

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
