import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import clsx from "clsx";
import { FaListAlt } from "react-icons/fa";
import { requireAuthentication } from "../../../../../../../_lib/auth/authenticateAndAuthorize";
import getLatestNoteAttributes from "../../../../../../../_lib/getLatestNoteAttributes";
import { prisma } from "../../../../../../../server/db";
import TabList from "../../../../../../_components/tabs/TabList";
import { TabsProvider } from "../../../../../../_components/tabs/TabsContext";
import { default as NoteTypeTab, default as Tab } from "./Tab";
import isAllowedToRead from "./lib/isAllowedToRead";
import isAllowedToReadRedacted from "./lib/isAllowedToReadRedacted";

type Props = Readonly<{
  className?: string;
  entity: Entity;
}>;

export const Notes = async ({ className, entity }: Props) => {
  const authentication = await requireAuthentication();

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
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );

  const tabs: Record<
    NoteType["id"],
    (
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
      authentication.authorize([
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
      ])
    );
  });

  if (filteredNoteTypes.length <= 0) return null;

  return (
    <section
      className={clsx(className, "rounded-2xl p-4 lg:p-8 bg-neutral-800/50")}
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
