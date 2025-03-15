"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type { Event, SilcTransaction } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import {
  startTransition,
  useId,
  useRef,
  useState,
  useTransition,
  type FormEventHandler,
} from "react";
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
  const [submitIsPending, startSubmitTransition] = useTransition();
  const receiverIdsInputId = useId();
  const valueInputId = useId();
  const descriptionInputId = useId();
  const receiverIdsInputRef = useRef<HTMLTextAreaElement>(null);
  const [receiverIds, setReceiverIds] = useState<string[]>(
    "transaction" in props && props.transaction
      ? [props.transaction.receiverId]
      : [],
  );

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  const formAction = (formData: FormData) => {
    startSubmitTransition(async () => {
      try {
        const response =
          "transaction" in props
            ? await updateSilcTransaction(formData)
            : await createSilcTransaction(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success!);
        if (formData.has("createAnother")) {
          receiverIdsInputRef.current?.focus();
          return;
        } else {
          setIsOpen(false);
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

  const handleReceiverIdsChange: FormEventHandler<HTMLTextAreaElement> = (
    event,
  ) => {
    startTransition(() => {
      const value = event.currentTarget.value;
      setReceiverIds(
        value
          .split("\n")
          .map((id) => id.trim())
          .filter(Boolean),
      );
    });
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
      >
        <h2 className="text-xl font-bold">
          {"transaction" in props
            ? "Transaktion bearbeiten"
            : "Transaktion erstellen"}
        </h2>

        <form action={formAction} className="mt-6">
          {"transaction" in props && props.transaction && (
            <input
              type="hidden"
              name="transactionId"
              value={props.transaction.id}
            />
          )}

          {receiverIds.map((id, index) => (
            <input key={index} type="hidden" name="receiverId[]" value={id} />
          ))}

          <label className="block" htmlFor={receiverIdsInputId}>
            Citizen (Sinister ID)
          </label>
          <textarea
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2 disabled:opacity-50 align-baseline h-32"
            name="citizenIds"
            required
            defaultValue={
              ("transaction" in props && props.transaction?.receiverId) || ""
            }
            id={receiverIdsInputId}
            ref={receiverIdsInputRef}
            onChange={handleReceiverIdsChange}
            readOnly={"transaction" in props}
            disabled={"transaction" in props}
          />
          <p className="text-xs mt-1">Eine ID pro Zeile, ohne Komma</p>

          <label className="block mt-4" htmlFor={valueInputId}>
            Wert
          </label>
          <input
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="value"
            required
            type="number"
            defaultValue={
              ("transaction" in props && props.transaction?.value) || 1
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
              ("transaction" in props && props.transaction?.description) || ""
            }
            id={descriptionInputId}
          />
          <p className="text-xs mt-1">optional</p>

          <div className="flex flex-col gap-2 mt-4">
            <Button type="submit" disabled={submitIsPending}>
              {submitIsPending ? (
                <FaSpinner className="animate-spin" />
              ) : (
                <FaSave />
              )}
              Speichern
            </Button>

            {!("transaction" in props) && (
              <Button
                type="submit"
                disabled={submitIsPending}
                variant="tertiary"
                name="createAnother"
              >
                {submitIsPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Speichern und weitere Transaktion erstellen
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};
