"use client";

import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import Note from "@/common/components/Note";
import TabPanel from "@/common/components/tabs/TabPanel";
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

      <div className="py-2 flex justify-between items-center mt-2">
        <div>
          <h4 className="font-bold">Alliance Manifest</h4>
          {/* <p></p> */}
        </div>

        <YesNoCheckbox {...register("documentAllianceManifest;read")} />
      </div>
    </TabPanel>
  );
};
