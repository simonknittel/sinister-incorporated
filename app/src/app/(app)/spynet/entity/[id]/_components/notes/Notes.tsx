import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import { FaListAlt } from "react-icons/fa";
import Tab from "~/app/_components/tabs/Tab";
import TabList from "~/app/_components/tabs/TabList";
import { TabsProvider } from "~/app/_components/tabs/TabsContext";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "~/app/_lib/getLatestNoteAttributes";
import { prisma } from "~/server/db";
import NoteTypeTab from "./Tab";
import isAllowedToRead from "./lib/isAllowedToRead";
import isAllowedToReadRedacted from "./lib/isAllowedToReadRedacted";

interface Props {
  entity: Entity;
}

const Notes = async ({ entity }: Props) => {
  const authentication = await authenticate();

  const [notes, allNoteTypes] = await prisma.$transaction([
    prisma.entityLog.findMany({
      where: {
        entityId: entity.id,
        type: "note",
      },
      include: {
        attributes: {
          include: {
            createdBy: true,
          },
        },
        submittedBy: true,
      },
    }),

    prisma.noteType.findMany(),
  ]);

  const sortedNotes = notes.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const tabs: Record<
    NoteType["id"],
    | (
        | (EntityLog & { attributes: EntityLogAttribute[] })
        | {
            id: EntityLog["id"];
            redacted: true;
          }
      )[]
  > = {};

  for (const note of sortedNotes) {
    if (!authentication) continue;

    const latestNoteAttributes = getLatestNoteAttributes(note);

    if (!latestNoteAttributes.noteTypeId) continue;

    if (!isAllowedToRead(note, authentication)) {
      if (!isAllowedToReadRedacted(note, authentication)) continue;

      if (!tabs[latestNoteAttributes.noteTypeId.value])
        tabs[latestNoteAttributes.noteTypeId.value] = [];

      tabs[latestNoteAttributes.noteTypeId.value].push({
        id: note.id,
        redacted: true,
      });

      continue;
    }

    if (!tabs[latestNoteAttributes.noteTypeId.value])
      tabs[latestNoteAttributes.noteTypeId.value] = [];

    tabs[latestNoteAttributes.noteTypeId.value].push(note);
  }

  const filteredNoteTypes = allNoteTypes.filter((noteType) => {
    return (
      authentication &&
      (authentication.authorize([
        {
          resource: "note",
          operation: "read",
          attributes: [
            {
              key: "noteTypeId",
              value: noteType.id,
            },
          ],
        },
      ]) ||
        authentication.authorize([
          {
            resource: "note",
            operation: "readRedacted",
            attributes: [
              {
                key: "noteTypeId",
                value: noteType.id,
              },
            ],
          },
        ]) ||
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
        ]))
    );
  });

  if (filteredNoteTypes.length <= 0) return null;

  return (
    <section
      className="rounded p-4 lg:p-8 bg-neutral-900 col-span-2 w-full place-self-start"
      style={{
        gridArea: "notes",
      }}
    >
      <h2 className="font-bold flex gap-2 items-center mb-2">
        <FaListAlt /> Notizen
      </h2>

      <TabsProvider initialActiveTab={filteredNoteTypes[0]!.id}>
        <TabList>
          {filteredNoteTypes.map((noteType) => (
            <Tab key={noteType.id} id={noteType.id}>
              {noteType.name}
            </Tab>
          ))}
        </TabList>

        {filteredNoteTypes.map((noteType) => (
          <NoteTypeTab
            key={noteType.id}
            noteType={noteType}
            notes={tabs[noteType.id] || []}
            entityId={entity.id}
          />
        ))}
      </TabsProvider>
    </section>
  );
};

export default Notes;
