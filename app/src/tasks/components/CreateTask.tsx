"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
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
  cta?: boolean;
}>;

export const CreateTask = ({ className, cta }: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Forbidden");
  const showPersonalizedAndGroup = authentication.authorize("task", "create", [
    {
      key: "taskVisibility",
      value: `${TaskVisibility.PERSONALIZED}`,
    },
  ]);
  const showNewSilc = authentication.authorize("task", "create", [
    {
      key: "taskRewardType",
      value: TaskRewardType.NEW_SILC,
    },
  ]);

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
  const [rewardType, setRewardType] = useState<string>(TaskRewardType.TEXT);

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
        variant={cta ? "primary" : "secondary"}
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
            autoFocus
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

          <p className="mt-4">Belohnung</p>
          <RadioGroup
            name="rewardType"
            items={[
              {
                value: TaskRewardType.TEXT,
                label: "Freitext",
              },
              {
                value: TaskRewardType.SILC,
                label: "SILC",
              },
              ...(showNewSilc
                ? [
                    {
                      value: TaskRewardType.NEW_SILC,
                      label: "Neue SILC",
                    },
                  ]
                : []),
            ]}
            value={rewardType}
            onChange={setRewardType}
            className="mt-2"
          />

          {rewardType === TaskRewardType.SILC && (
            <NumberInput
              name="rewardTypeSilcValue"
              label="SILC (pro Citizen)"
              hint="Diese SILC werden von deinem Konto abgezogen."
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
              label="SILC (pro Citizen)"
              hint="Diese SILC werden neu ausgegeben."
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
              hint={
                <>
                  Beispiel:{" "}
                  <span className="italic">
                    &ldquo;500.000 aUEC pro Helm&rdquo;
                  </span>
                </>
              }
              maxLength={128}
              defaultValue={
                state?.requestPayload?.has("rewardTypeTextValue")
                  ? (state.requestPayload.get("rewardTypeTextValue") as string)
                  : ""
              }
              required
              className="mt-4"
            />
          )}

          <p className="mt-4">Sichtbarkeit</p>
          <RadioGroup
            name="visibility"
            items={[
              {
                value: TaskVisibility.PUBLIC,
                label: "Öffentlich",
                hint: "Dieser Task kann von jedem angenommen und erfüllt werden.",
              },
              ...(showPersonalizedAndGroup
                ? [
                    {
                      value: TaskVisibility.PERSONALIZED,
                      label: "Personalisiert",
                      hint: "Dieser Task wird an einen Citizen adressiert und muss von diesem erfüllt werden. Werden mehrere Citizen angegeben, wird dieser Task für jeden Citizen dupliziert.",
                    },
                    {
                      value: TaskVisibility.GROUP,
                      label: "Gruppe",
                      hint: "Dieser Task wird an eine Gruppe von Citizen adressiert und muss von dieser erfüllt werden.",
                    },
                  ]
                : []),
            ]}
            value={visibility}
            onChange={setVisibility}
            className="mt-2"
          />

          {visibility === TaskVisibility.PUBLIC && (
            <NumberInput
              name="assignmentLimit"
              label="Von wie vielen Citizen kann der Task angenommen werden?"
              hint="optional"
              defaultValue={
                state?.requestPayload?.has("assignmentLimit")
                  ? (state.requestPayload.get("assignmentLimit") as string)
                  : 1
              }
              min={1}
              className="mt-4"
            />
          )}

          {visibility === TaskVisibility.PERSONALIZED && (
            <CitizenInput name="assignedToId" multiple className="mt-4" />
          )}

          {visibility === TaskVisibility.GROUP && (
            <CitizenInput name="assignedToId" multiple className="mt-4" />
          )}

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

          <NumberInput
            name="repeatable"
            label="Wie häufig kann dieser Task abgeschlossen werden?"
            defaultValue={
              state?.requestPayload?.has("repeatable")
                ? (state.requestPayload.get("repeatable") as string)
                : 1
            }
            required
            min={1}
            className="mt-4"
          />

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
