"use client";

import TabPanel from "@/common/components/tabs/TabPanel";
import YesNoCheckbox from "@/common/components/YesNoCheckbox";
import { type ClassificationLevel, type NoteType } from "@prisma/client";
import { usePermissionsContext } from "../PermissionsContext";
import { CitizenIdSection } from "./components/CitizenIdSection";
import CitizenSection from "./components/CitizenSection";
import { CommunityMonikerSection } from "./components/CommunityMonikerSection";
import DiscordIdSection from "./components/DiscordIdSection";
import HandleSection from "./components/HandleSection";
import LastSeenSection from "./components/LastSeenSection";
import { NoteSection } from "./components/NoteSection";
import TeamspeakIdSection from "./components/TeamspeakIdSection";

type Props = Readonly<{
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
}>;

export const CitizenTab = ({ noteTypes, classificationLevels }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="citizen">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Notizarten verwalten</h4>

        <YesNoCheckbox {...register("noteType;manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Geheimhaltungsstufen verwalten</h4>

        <YesNoCheckbox {...register("classificationLevel;manage")} />
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
