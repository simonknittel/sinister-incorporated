import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import Tab from "@/modules/common/components/tabs/Tab";
import TabList from "@/modules/common/components/tabs/TabList";
import { TabsProvider } from "@/modules/common/components/tabs/TabsContext";
import {
  findCitizenNoteTabs,
  type CitizenNoteTab,
} from "@sam-monorepo/application";
import { type Citizen } from "@sam-monorepo/database/client";
import clsx from "clsx";
import { NoteTypePanel } from "./NoteTypePanel";

interface Props {
  readonly className?: string;
  readonly entity: Pick<Citizen, "id">;
}

export const Notes = async ({ className, entity }: Props) => {
  let filteredNoteTypes: CitizenNoteTab[];
  try {
    filteredNoteTypes = await findCitizenNoteTabs(
      getApplicationContext(),
      await getRequestActor(),
      { citizenId: entity.id },
    );
  } catch (error) {
    return throwApplicationErrorForPage(error);
  }

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
            notes={noteType.notes}
            entityId={entity.id}
          />
        ))}
      </TabsProvider>
    </section>
  );
};
