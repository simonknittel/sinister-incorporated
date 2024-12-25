import { getAllClassificationLevelsDeduped } from "@/common/utils/cached/getAllClassificationLevels";
import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import clsx from "clsx";

type Props = Readonly<{
  className?: string;
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}>;

export const ClassificationLevel = async ({ className, note }: Props) => {
  const allClassificationLevels = await getAllClassificationLevelsDeduped();
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
