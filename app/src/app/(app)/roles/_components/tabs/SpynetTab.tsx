"use client";

import { type ClassificationLevel, type NoteType } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import YesNoCheckbox from "~/app/_components/YesNoCheckbox";
import TabPanel from "~/app/_components/tabs/TabPanel";
import { type FormValues } from "~/app/_lib/auth/FormValues";
import { CitizenIdSection } from "./components/CitizenIdSection";
import CitizenSection from "./components/CitizenSection";
import { CommunityMonikerSection } from "./components/CommunityMonikerSection";
import DiscordIdSection from "./components/DiscordIdSection";
import HandleSection from "./components/HandleSection";
import LastSeenSection from "./components/LastSeenSection";
import NoteSection from "./components/NoteSection";
import TeamspeakIdSection from "./components/TeamspeakIdSection";

interface Props {
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
}

const SpynetTab = ({ noteTypes, classificationLevels }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="spynet">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Notizarten verwalten</h4>

        <YesNoCheckbox register={register("noteType.manage")} />
      </div>

      <CitizenSection className="mt-4" />

      <HandleSection className="mt-4" />

      <CommunityMonikerSection className="mt-4" />

      <CitizenIdSection className="mt-4" />

      <DiscordIdSection className="mt-4" />

      <TeamspeakIdSection className="mt-4" />

      <LastSeenSection className="mt-4" />

      <NoteSection
        noteTypes={noteTypes}
        classificationLevels={classificationLevels}
        className="mt-4"
      />
    </TabPanel>
  );
};

export default SpynetTab;
