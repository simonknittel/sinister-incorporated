import { requireAuthentication } from "@/auth/server";
import TabPanel from "@/common/components/tabs/TabPanel";
import getAllClassificationLevels from "@/common/utils/cached/getAllClassificationLevels";
import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import { AddNote } from "./AddNote";
import { SingleNote } from "./SingleNote";
import SingleNoteRedacted from "./SingleNoteRedacted";
import isAllowedToCreate from "./lib/isAllowedToCreate";

type Props = Readonly<{
  noteType: NoteType;
  notes: (
    | (EntityLog & {
        attributes: EntityLogAttribute[];
      })
    | { id: EntityLog["id"]; redacted: true }
  )[];
  entityId: Entity["id"];
}>;

export const NoteTypePanel = async ({ noteType, notes, entityId }: Props) => {
  const [authentication, allClassificationLevels] = await Promise.all([
    requireAuthentication(),
    getAllClassificationLevels(),
  ]);

  const filteredClassificationLevels = allClassificationLevels.filter(
    (classificationLevel) =>
      isAllowedToCreate(classificationLevel.id, authentication, noteType.id),
  );

  const showAddNote = authentication.authorize("note", "create", [
    {
      key: "noteTypeId",
      value: noteType.id,
    },
  ]);

  return (
    <TabPanel id={noteType.id}>
      {showAddNote && (
        <AddNote
          entityId={entityId}
          noteTypeId={noteType.id}
          classificationLevels={filteredClassificationLevels}
        />
      )}

      {notes.map((note) => {
        if ("redacted" in note) return <SingleNoteRedacted key={note.id} />;
        return <SingleNote key={note.id} note={note} />;
      })}

      {notes.length <= 0 && (
        <p className="text-neutral-500 italic mt-8">Keine Einträge vorhanden</p>
      )}
    </TabPanel>
  );
};
