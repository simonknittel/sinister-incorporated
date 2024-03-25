import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import clsx from "clsx";
import getAllClassificationLevels from "../../../../../../../lib/cached/getAllClassificationLevels";
import getLatestNoteAttributes from "../../../../../../../lib/getLatestNoteAttributes";

interface Props {
  className?: string;
  note: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
  };
}

const ClassificationLevel = async ({ className, note }: Readonly<Props>) => {
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

export default ClassificationLevel;
