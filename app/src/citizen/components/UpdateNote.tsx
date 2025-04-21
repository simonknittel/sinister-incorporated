import { UpdateNoteModal } from "@/citizen/components/notes/UpdateNoteModal";
import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import { getAllNoteTypes } from "@/spynet/queries";
import { getCreatableClassificationLevelsDeduped } from "@/spynet/utils/getAllClassificationLevels";
import { type EntityLog, type EntityLogAttribute } from "@prisma/client";

interface Props {
  readonly note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}

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
