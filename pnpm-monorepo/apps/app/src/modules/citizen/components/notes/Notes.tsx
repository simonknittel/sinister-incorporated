import { prisma } from "@/db";
import { getRequestActor } from "@/modules/application";
import {
  CITIZEN_NOTE_SELECT,
  type CitizenNote,
} from "@/modules/citizen/queries/citizenLogTableSelect";
import Tab from "@/modules/common/components/tabs/Tab";
import TabList from "@/modules/common/components/tabs/TabList";
import { TabsProvider } from "@/modules/common/components/tabs/TabsContext";
import { canReadNote, canReadNoteRedacted } from "@sam-monorepo/application";
import {
  type Citizen,
  type CitizenLog,
  type NoteType,
} from "@sam-monorepo/database/client";
import clsx from "clsx";
import { NoteTypePanel } from "./NoteTypePanel";

interface Props {
  readonly className?: string;
  readonly entity: Pick<Citizen, "id">;
}

type VisibleNote = CitizenNote | { id: CitizenLog["id"]; redacted: true };

export const Notes = async ({ className, entity }: Props) => {
  const actor = await getRequestActor();

  /**
   * Each note shows in the tab of its note type, thus a note of a deleted
   * note type does not show
   */
  const allNoteTypes = await prisma.noteType.findMany({
    select: {
      id: true,
      name: true,
      citizenLogs: {
        where: {
          citizenId: entity.id,
          type: "note",
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        select: CITIZEN_NOTE_SELECT,
      },
    },
  });

  const tabs: Record<NoteType["id"], VisibleNote[]> = {};

  for (const noteType of allNoteTypes) {
    const notes: VisibleNote[] = [];

    for (const note of noteType.citizenLogs) {
      if (canReadNote(actor, note)) notes.push(note);
      else if (canReadNoteRedacted(actor, note))
        notes.push({ id: note.id, redacted: true });
    }

    tabs[noteType.id] = notes;
  }

  const filteredNoteTypes = allNoteTypes.filter((noteType) => {
    const attributes = [{ key: "noteTypeId" as const, value: noteType.id }];

    return (
      actor.authorize("note", "read", attributes) ||
      actor.authorize("note", "readRedacted", attributes) ||
      actor.authorize("note", "create", attributes)
    );
  });

  if (filteredNoteTypes.length <= 0) return null;

  return (
    <section className={clsx(className, "rounded-primary bg-secondary p-4")}>
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
