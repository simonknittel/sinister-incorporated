import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { FaListAlt } from "react-icons/fa";
import Tab from "~/app/_components/tabs/Tab";
import TabList from "~/app/_components/tabs/TabList";
import { TabsProvider } from "~/app/_components/tabs/TabsContext";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { prisma } from "~/server/db";
import NoteTypeTab from "./Tab";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
    })[];
  };
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
            notes={sortedNotes}
            entityId={entity.id}
          />
        ))}
      </TabsProvider>
    </section>
  );
};

export default Notes;
