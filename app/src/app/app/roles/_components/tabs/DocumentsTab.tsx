"use client";

import Note from "@/common/components/Note";
import TabPanel from "@/common/components/tabs/TabPanel";
import YesNoCheckbox from "@/common/components/YesNoCheckbox";
import { usePermissionsContext } from "../PermissionsContext";

export const DocumentsTab = () => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="documents">
      <Note
        type="info"
        message="Diese Berechtigungen verhindert nicht, dass sich Benutzer die Dateien
        herunterladen und selbstständig weiterverbreiten."
      />

      <div className="py-2 flex justify-between items-center mt-2">
        <div>
          <h4 className="font-bold">Einführungskompendium</h4>
          {/* <p></p> */}
        </div>

        <YesNoCheckbox {...register("documentIntroductionCompendium;read")} />
      </div>
    </TabPanel>
  );
};