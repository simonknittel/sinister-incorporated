"use client";

import { useAuthentication } from "@/auth/client";
import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { Select } from "@/common/components/Select";
import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import {
  type ClassificationLevel,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaPen, FaSave, FaSpinner } from "react-icons/fa";

interface Props {
  className?: string;
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
}

interface FormValues {
  noteTypeId: string;
  classificationLevelId: string;
}

const UpdateNoteModal = ({
  className,
  note,
  noteTypes = [],
  classificationLevels = [],
}: Readonly<Props>) => {
  const { noteTypeId, classificationLevelId } = getLatestNoteAttributes(note);

  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      noteTypeId: noteTypeId?.value,
      classificationLevelId: classificationLevelId?.value,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const noteTypeSelectId = useId();
  const classificationLevelSelectId = useId();
  const authentication = useAuthentication();

  const selectedNoteTypeId = useWatch<FormValues>({
    control,
    name: "noteTypeId",
  });

  const filteredClassificationLevels = classificationLevels.filter(
    (classificationLevel) => {
      const authorizationAttributes = [
        {
          key: "noteTypeId",
          value: selectedNoteTypeId,
        },
        {
          key: "classificationLevelId",
          value: classificationLevel.id,
        },
      ];

      return (
        authentication &&
        // @ts-expect-error The authorization types need to get overhauled
        authentication.authorize("note", "create", authorizationAttributes)
      );
    },
  );

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/spynet/entity/${note.entityId}/log/${note.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            noteTypeId: data.noteTypeId,
            classificationLevelId: data.classificationLevelId,
          }),
        },
      );

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
        setIsOpen(false);
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
    <>
      <Button
        onClick={() => setIsOpen(true)}
        type="button"
        className={className}
        variant="tertiary"
      >
        <FaPen /> Bearbeiten
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Bearbeiten</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="mt-6 block" htmlFor={noteTypeSelectId}>
            Notizart
          </label>

          <Select
            className="mt-2"
            id={noteTypeSelectId}
            {...register("noteTypeId")}
          >
            {noteTypes.map((noteTye) => (
              <option key={noteTye.id} value={noteTye.id}>
                {noteTye.name}
              </option>
            ))}
          </Select>

          <label className="mt-4 block" htmlFor={classificationLevelSelectId}>
            Geheimhaltungsstufe
          </label>

          <Select
            className="mt-2"
            id={classificationLevelSelectId}
            {...register("classificationLevelId")}
          >
            {filteredClassificationLevels.map((classificationLevel) => (
              <option
                key={classificationLevel.id}
                value={classificationLevel.id}
              >
                {classificationLevel.name}
              </option>
            ))}
          </Select>

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UpdateNoteModal;
