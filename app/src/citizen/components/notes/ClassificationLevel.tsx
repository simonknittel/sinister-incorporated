import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import { getAllClassificationLevels } from "@/spynet/queries";
import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import clsx from "clsx";

interface Props {
  readonly className?: string;
  readonly note: EntityLog & {
    readonly attributes: EntityLogAttribute[];
  };
}

export const ClassificationLevel = async ({ className, note }: Props) => {
  const allClassificationLevels = await getAllClassificationLevels();
  const { classificationLevelId } = getLatestNoteAttributes(note);

  return (
    <p className={clsx(className, "flex gap-2 items-center")}>
      {allClassificationLevels.find(
        (classificationLevel) =>
          classificationLevel.id === classificationLevelId?.value,
      )?.name || "Geheimhaltungsstufe Unbekannt"}
    </p>
  );
};
