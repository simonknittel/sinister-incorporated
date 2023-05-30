import {
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import getAllClassificationLevels from "~/app/_lib/cached/getAllClassificationLevels";
import getAllNoteTypes from "~/app/_lib/cached/getAllNoteTypes";
import UpdateNoteModal from "./UpdateNoteModal";

interface Props {
  note: EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
  };
}

const UpdateNote = async ({ note }: Props) => {
  const [allNoteTypes, allClassificationLevels] = await Promise.all([
    getAllNoteTypes(),
    getAllClassificationLevels(),
  ]);

  return (
    <>
      <span>&bull;</span>
      <UpdateNoteModal
        note={note}
        noteTypes={allNoteTypes}
        classificationLevels={allClassificationLevels}
      />
    </>
  );
};

export default UpdateNote;
