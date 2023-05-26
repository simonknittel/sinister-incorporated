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
import isAllowedToCreate from "./lib/isAllowedToCreate";
import isAllowedToRead from "./lib/isAllowedToRead";

interface Props {
  noteType: NoteType;
  notes: (EntityLog & {
    attributes: EntityLogAttribute[];
  })[];
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

  const filteredNotes = notes
    .filter((note) => {
      const latestNoteType = note.attributes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .find((attribute) => attribute.key === "noteTypeId");

      return latestNoteType && latestNoteType.value === noteType.id;
    })
    .filter((note) => isAllowedToRead(note, authentication));

  return (
    <TabPanel key={noteType.id} id={noteType.id}>
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

      {filteredNotes.map((note) => (
        <SingleNote key={note.id} note={note} />
      ))}

      {filteredNotes.length <= 0 && (
        <p className="text-neutral-500 italic mt-8">Keine Einträge vorhanden</p>
      )}
    </TabPanel>
  );
};

export default NoteTypeTab;
