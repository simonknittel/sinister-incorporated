import { type EntityLog, type EntityLogAttribute } from "@prisma/client";
import getAllClassificationLevels from "../../../../../_lib/cached/getAllClassificationLevels";
import getAllNoteTypes from "../../../../../_lib/cached/getAllNoteTypes";
import UpdateNoteModal from "../../entity/[id]/_components/notes/UpdateNoteModal";

interface Props {
  note: EntityLog & {
    attributes: EntityLogAttribute[];
  };
}

const UpdateNote = async ({ note }: Readonly<Props>) => {
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
