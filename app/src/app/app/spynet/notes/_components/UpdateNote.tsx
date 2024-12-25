import { getCreatableClassificationLevelsDeduped } from "@/common/utils/cached/getAllClassificationLevels";
import getAllNoteTypes from "@/common/utils/cached/getAllNoteTypes";
import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import { UpdateNoteModal } from "../../entity/[id]/_components/notes/UpdateNoteModal";

type Props = Readonly<{
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}>;

export const UpdateNote = async ({ note }: Props) => {
  const { noteTypeId } = getLatestNoteAttributes(note);

  const [allNoteTypes, classificationLevels] = await Promise.all([
    getAllNoteTypes(),
    getCreatableClassificationLevelsDeduped(noteTypeId!.value),
  ]);

  return (
    <UpdateNoteModal
      note={note}
      noteTypes={allNoteTypes}
      classificationLevels={classificationLevels}
    />
  );
};
