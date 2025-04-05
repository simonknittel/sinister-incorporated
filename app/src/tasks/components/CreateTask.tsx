"use client";

import Button from "@/common/components/Button";
import { DateTimeInput } from "@/common/components/form/DateTimeInput";
import { NumberInput } from "@/common/components/form/NumberInput";
import { RadioGroup } from "@/common/components/form/RadioGroup";
import { Textarea } from "@/common/components/form/Textarea";
import { TextInput } from "@/common/components/form/TextInput";
import Modal from "@/common/components/Modal";
import Note from "@/common/components/Note";
import { CitizenInput } from "@/spynet/components/CitizenInput";
import { TaskRewardType, TaskVisibility } from "@prisma/client";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useActionState, useState } from "react";
import toast from "react-hot-toast";
import { FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createTask } from "../actions/createTask";

type Props = Readonly<{
  className?: string;
}>;

export const CreateTask = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    async (previousState: unknown, formData: FormData) => {
      try {
        const response = await createTask(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return response;
        }

        toast.success(response.success!);
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
  const [visibility, setVisibility] = useState<string>(TaskVisibility.PUBLIC);
  const [rewardType, setRewardType] = useState<string>(TaskRewardType.AUEC);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleClick}
        variant="secondary"
        className={clsx(className)}
        title="Task erstellen"
      >
        <span className="hidden md:inline">Task erstellen</span>
        <FaPlus />
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
        heading={<h2>Task erstellen</h2>}
      >
        <form action={formAction}>
          <p>Sichtbarkeit</p>
          <RadioGroup
            name="visibility"
            items={[
              {
                value: TaskVisibility.PUBLIC,
                label: "Öffentlich",
              },
              {
                value: TaskVisibility.PERSONALIZED,
                label: "Personalisiert",
              },
            ]}
            value={visibility}
            onChange={setVisibility}
            className="mt-2"
          />

          {visibility === TaskVisibility.PUBLIC && (
            <NumberInput
              name="assignmentLimit"
              label="Maximale Anzahl an Zuweisungen"
              hint="optional"
              defaultValue={
                state?.requestPayload?.has("assignmentLimit")
                  ? (state.requestPayload.get("assignmentLimit") as string)
                  : 1
              }
              min={1}
              required
              className="mt-4"
            />
          )}

          {visibility === TaskVisibility.PERSONALIZED && (
            <CitizenInput name="assignedToId" multiple className="mt-4" />
          )}

          <TextInput
            name="title"
            label="Titel"
            maxLength={64}
            defaultValue={
              state?.requestPayload?.has("title")
                ? (state.requestPayload.get("title") as string)
                : ""
            }
            required
            className="mt-4"
          />

          <Textarea
            name="description"
            label="Beschreibung"
            hint="optional"
            maxLength={512}
            defaultValue={
              state?.requestPayload?.has("description")
                ? (state.requestPayload.get("description") as string)
                : ""
            }
            className="mt-4"
          />

          <DateTimeInput
            name="expiresAt"
            label="Ablaufdatum"
            hint="optional"
            defaultValue={
              state?.requestPayload?.has("expiresAt")
                ? (state.requestPayload.get("expiresAt") as string)
                : ""
            }
            className="mt-4"
          />

          <p className="mt-4">Belohnung</p>
          <RadioGroup
            name="rewardType"
            items={[
              {
                value: TaskRewardType.AUEC,
                label: "aUEC",
              },
              {
                value: TaskRewardType.SILC,
                label: "SILC",
              },
              {
                value: TaskRewardType.TEXT,
                label: "Text",
              },
            ]}
            value={rewardType}
            onChange={setRewardType}
            className="mt-2"
          />

          {rewardType === TaskRewardType.AUEC && (
            <NumberInput
              name="rewardTypeNumberValue"
              label="aUEC-Betrag pro Citizen"
              maxLength={512}
              defaultValue={
                state?.requestPayload?.has("rewardTypeNumberValue")
                  ? (state.requestPayload.get(
                      "rewardTypeNumberValue",
                    ) as string)
                  : 1
              }
              min={1}
              required
              className="mt-4"
            />
          )}

          {rewardType === TaskRewardType.SILC && (
            <NumberInput
              name="rewardTypeSilcValue"
              label="SILC-Betrag pro Citizen"
              hint="Diese SILC werden vom eigenen Konto abgezogen."
              defaultValue={
                state?.requestPayload?.has("rewardTypeSilcValue")
                  ? (state.requestPayload.get("rewardTypeSilcValue") as string)
                  : 1
              }
              min={1}
              required
              className="mt-4"
            />
          )}

          {rewardType === TaskRewardType.NEW_SILC && (
            <NumberInput
              name="rewardTypeNewSilcValue"
              label="SILC-Betrag pro Citizen"
              hint="Diese SILC werden neu generiert."
              defaultValue={
                state?.requestPayload?.has("rewardTypeNewSilcValue")
                  ? (state.requestPayload.get(
                      "rewardTypeNewSilcValue",
                    ) as string)
                  : 1
              }
              min={1}
              required
              className="mt-4"
            />
          )}

          {rewardType === TaskRewardType.TEXT && (
            <TextInput
              name="rewardTypeTextValue"
              label="Belohnungstext"
              maxLength={512}
              defaultValue={
                state?.requestPayload?.has("rewardTypeTextValue")
                  ? (state.requestPayload.get("rewardTypeTextValue") as string)
                  : ""
              }
              required
              className="mt-4"
            />
          )}

          <Button type="submit" disabled={isPending} className="mt-4 ml-auto">
            {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>

          {state?.error && (
            <Note type="error" message={state.error} className="mt-4" />
          )}
        </form>
      </Modal>
    </>
  );
};
