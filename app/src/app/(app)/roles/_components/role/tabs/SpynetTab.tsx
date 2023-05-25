"use client";

import { type ClassificationLevel, type NoteType } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import TabPanel from "~/app/_components/tabs/TabPanel";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";
import { type FormValues } from "../../../../../_lib/auth/FormValues";
import CitizenSection from "./components/CitizenSection";
import DiscordIdSection from "./components/DiscordIdSection";
import HandleSection from "./components/HandleSection";
import NoteSection from "./components/NoteSection";

interface Props {
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
}

const SpynetTab = ({ noteTypes, classificationLevels }: Props) => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="spynet">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Notizarten verwalten</h4>

        <YesNoCheckbox register={register("noteType.manage")} />
      </div>

      <CitizenSection className="mt-4" />

      <HandleSection className="mt-4" />

      <DiscordIdSection className="mt-4" />

      <NoteSection
        noteTypes={noteTypes}
        classificationLevels={classificationLevels}
        className="mt-4"
      />
    </TabPanel>
  );
};

export default SpynetTab;
