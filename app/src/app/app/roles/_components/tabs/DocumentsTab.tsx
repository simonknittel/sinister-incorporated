"use client";

import Note from "@/app/_components/Note";
import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import TabPanel from "../../../../_components/tabs/TabPanel";
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
