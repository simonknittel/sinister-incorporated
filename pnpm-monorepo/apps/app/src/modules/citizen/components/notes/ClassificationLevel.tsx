import { getAllClassificationLevels } from "@/modules/spynet/queries/getAllClassificationLevels";
import type { CitizenNoteRow } from "@sam-monorepo/application";
import clsx from "clsx";

interface Props {
  readonly className?: string;
  readonly note: CitizenNoteRow;
}

export const ClassificationLevel = async ({ className, note }: Props) => {
  const allClassificationLevels = await getAllClassificationLevels();

  return (
    <p className={clsx(className, "flex items-center gap-2")}>
      {allClassificationLevels.find(
        (classificationLevel) =>
          classificationLevel.id === note.classificationLevelId,
      )?.name || "Geheimhaltungsstufe Unbekannt"}
    </p>
  );
};
