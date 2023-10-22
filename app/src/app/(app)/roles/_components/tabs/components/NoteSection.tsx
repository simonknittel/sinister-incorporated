import { type ClassificationLevel, type NoteType } from "@prisma/client";
import clsx from "clsx";
import { useFormContext, useWatch } from "react-hook-form";
import { FaPlus, FaTrash } from "react-icons/fa";
import Button from "~/app/_components/Button";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import { type FormValues } from "~/app/_lib/auth/FormValues";

interface Props {
  className?: string;
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
}

const NoteSection = ({ className, noteTypes, classificationLevels }: Readonly<Props>) => {
  const { register, setValue, getValues } = useFormContext<FormValues>();
  const rules = useWatch<FormValues, "note">({ name: "note" });

  const handleCreate = () => {
    const rules = getValues("note");

    setValue("note", [
      ...(rules || []),
      {
        noteTypeId: "",
        classificationLevelId: "",
        alsoUnconfirmed: false,
        operation: "create",
      },
    ]);
  };

  const handleDelete = (indexToRemove: number) => {
    const rules = getValues("note");

    setValue(
      "note",
      rules.filter((rule, index) => index !== indexToRemove)
    );
  };

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Notizen</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2">
        <div className="grid grid-cols-5 gap-2 font-bold">
          <span>Notizart</span>
          <span>Geheimhaltungsstufe</span>
          <span>Nicht Bestätigte</span>
          <span>Aktion</span>
        </div>

        {rules && rules.length > 0 ? (
          rules.map((rule, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 mt-2">
              <select
                {...register(`note.${index}.noteTypeId`, { required: true })}
                className="bg-neutral-900 rounded px-4 h-11"
              >
                <option value="*">Alle</option>

                {noteTypes.map((noteType) => (
                  <option key={noteType.id} value={noteType.id}>
                    {noteType.name}
                  </option>
                ))}
              </select>

              <select
                {...register(`note.${index}.classificationLevelId`, {
                  required: true,
                })}
                className="bg-neutral-900 rounded px-4 h-11"
              >
                <option value="*">Alle</option>

                {classificationLevels.map((classificationLevel) => (
                  <option
                    key={classificationLevel.id}
                    value={classificationLevel.id}
                  >
                    {classificationLevel.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center">
                <YesNoCheckbox
                  register={register(`note.${index}.alsoUnconfirmed`)}
                />
              </div>

              <select
                {...register(`note.${index}.operation`, {
                  required: true,
                })}
                className="bg-neutral-900 rounded px-4 h-11"
              >
                <option value="manage">Alle</option>

                <option value="create">Erstellen</option>
                <option value="read">Lesen</option>
                <option value="readRedacted">Lesen (Redacted)</option>
                <option value="update">Bearbeiten</option>
                <option value="delete">Löschen</option>
                <option value="confirm">Bestätigen</option>
              </select>

              <div className="flex items-center justify-end">
                <Button
                  variant="tertiary"
                  onClick={() => handleDelete(index)}
                  type="button"
                >
                  <FaTrash /> Löschen
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-neutral-500 italic mt-2">
            Bisher gibt es keine Regeln.
          </p>
        )}

        <Button variant="tertiary" onClick={handleCreate} type="button">
          <FaPlus /> Regel erstellen
        </Button>
      </div>
    </div>
  );
};

export default NoteSection;
