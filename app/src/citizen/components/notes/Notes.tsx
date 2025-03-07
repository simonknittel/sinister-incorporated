import { requireAuthentication } from "@/auth/server";
import Tab from "@/common/components/tabs/Tab";
import TabList from "@/common/components/tabs/TabList";
import { TabsProvider } from "@/common/components/tabs/TabsContext";
import getLatestNoteAttributes from "@/common/utils/getLatestNoteAttributes";
import { prisma } from "@/db";
import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
} from "@prisma/client";
import clsx from "clsx";
import { NoteTypePanel } from "./NoteTypePanel";
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

  const sortedNotes = notes.toSorted(
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
    const latestNoteAttributes = getLatestNoteAttributes(note);

    if (!latestNoteAttributes.noteTypeId) continue;

    if (!(await isAllowedToRead(note, authentication))) {
      if (!(await isAllowedToReadRedacted(note, authentication))) continue;

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

  const filteredNoteTypes = (
    await Promise.all(
      allNoteTypes.map(async (noteType) => {
        return {
          noteType,
          include:
            (await authentication.authorize("note", "read", [
              {
                key: "noteTypeId",
                value: noteType.id,
              },
            ])) ||
            (await authentication.authorize("note", "readRedacted", [
              {
                key: "noteTypeId",
                value: noteType.id,
              },
            ])) ||
            (await authentication.authorize("note", "create", [
              {
                key: "noteTypeId",
                value: noteType.id,
              },
            ])),
        };
      }),
    )
  )
    .filter(({ include }) => include)
    .map(({ noteType }) => noteType);

  if (filteredNoteTypes.length <= 0) return null;

  return (
    <section
      className={clsx(
        className,
        "rounded-2xl p-4 lg:p-8 bg-neutral-800/50 w-full",
      )}
    >
      <TabsProvider initialActiveTab={filteredNoteTypes[0].id}>
        <TabList>
          {filteredNoteTypes.map((noteType) => (
            <Tab key={noteType.id} id={noteType.id}>
              {noteType.name}
            </Tab>
          ))}
        </TabList>

        {filteredNoteTypes.map((noteType) => (
          <NoteTypePanel
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
