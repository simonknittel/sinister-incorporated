"use client";

import {
  type ClassificationLevel,
  type Entity,
  type NoteType,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaSave, FaSpinner } from "react-icons/fa";
import Button from "../../../../../../_components/Button";
import Select from "../../../../../../_components/Select";

interface Props {
  entityId: Entity["id"];
  noteTypeId: NoteType["id"];
  classificationLevels: ClassificationLevel[];
}

interface FormValues {
  content: string;
  classificationLevelId: ClassificationLevel["id"];
}

const AddNote = ({
  entityId,
  noteTypeId,
  classificationLevels,
}: Readonly<Props>) => {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormValues>();
  const [isLoading, setIsLoading] = useState(false);
  const contentInputId = useId();
  const classificationLevelSelectId = useId();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/spynet/entity/${entityId}/log`, {
        method: "POST",
        body: JSON.stringify({
          type: "note",
          content: data.content,
          noteTypeId,
          classificationLevelId: data.classificationLevelId,
        }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
        reset();
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
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
      <textarea
        className="p-2 rounded-l bg-neutral-800 w-full"
        id={contentInputId}
        {...register("content", { required: true })}
      />

      <div className="grid grid-cols-3 gap-1 mt-1">
        {classificationLevels.length > 1 && (
          <Select
            id={classificationLevelSelectId}
            {...register("classificationLevelId", { required: true })}
            className="!bg-neutral-800"
          >
            {classificationLevels.map((classificationLevel) => (
              <option
                key={classificationLevel.id}
                value={classificationLevel.id}
              >
                {classificationLevel.name}
              </option>
            ))}
          </Select>
        )}

        {classificationLevels.length === 1 && classificationLevels[0] && (
          <input
            type="hidden"
            {...register("classificationLevelId", {
              value: classificationLevels[0].id,
            })}
          />
        )}

        <div className="flex justify-end col-start-3">
          <Button
            type="submit"
            disabled={isLoading}
            title="Hinzufügen"
            variant="secondary"
          >
            {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            Speichern
          </Button>
        </div>
      </div>
    </form>
  );
};

export default AddNote;
