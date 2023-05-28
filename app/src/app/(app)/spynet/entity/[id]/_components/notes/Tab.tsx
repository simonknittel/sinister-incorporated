import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import TabPanel from "~/app/_components/tabs/TabPanel";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getAllClassificationLevels from "~/app/_lib/cached/getAllClassificationLevels";
import AddNote from "./AddNote";
import SingleNote from "./SingleNote";
import SingleNoteRedacted from "./SingleNoteRedacted";
import isAllowedToCreate from "./lib/isAllowedToCreate";

interface Props {
  noteType: NoteType;
  notes: (
    | (EntityLog & {
        attributes: EntityLogAttribute[];
      })
    | { id: EntityLog["id"]; redacted: true }
  )[];
  entityId: Entity["id"];
}

const NoteTypeTab = async ({ noteType, notes, entityId }: Props) => {
  const [authentication, allClassificationLevels] = await Promise.all([
    authenticate(),
    getAllClassificationLevels(),
  ]);

  const filteredClassificationLevels = allClassificationLevels.filter(
    (classificationLevel) =>
      isAllowedToCreate(classificationLevel.id, authentication, noteType.id)
  );

  return (
    <TabPanel id={noteType.id}>
      {authentication &&
        authentication.authorize([
          {
            resource: "note",
            operation: "create",
            attributes: [
              {
                key: "noteTypeId",
                value: noteType.id,
              },
            ],
          },
        ]) && (
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

export default NoteTypeTab;
