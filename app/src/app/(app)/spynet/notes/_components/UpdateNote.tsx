import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import getAllClassificationLevels from "~/app/_lib/cached/getAllClassificationLevels";
import getAllNoteTypes from "~/app/_lib/cached/getAllNoteTypes";
import UpdateNoteModal from "../../entity/[id]/_components/notes/UpdateNoteModal";

interface Props {
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}

const UpdateNote = async ({ note }: Props) => {
  const [allNoteTypes, allClassificationLevels] = await Promise.all([
    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  return (
    <UpdateNoteModal
      note={note}
      noteTypes={allNoteTypes}
      classificationLevels={allClassificationLevels}
    />
  );
};

export default UpdateNote;
