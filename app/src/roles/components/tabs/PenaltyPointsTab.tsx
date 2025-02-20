"use client";

import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import TabPanel from "@/common/components/tabs/TabPanel";
import { usePermissionsContext } from "../PermissionsContext";

export const PenaltyPointsTab = () => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="penalty_points">
      <div className="py-2 flex justify-between items-center gap-2  mt-2">
        <div>
          <h4 className="font-bold">Eintragen</h4>
          <p className="text-sm">
            Citizen mit dieser Berechtigung können Strafpunkte bei anderen
            Citizen eintragen. Diese Berechtigung gibt auch Zugriff auf die
            Seite mit aktiven Strafpunkten.
          </p>
        </div>

        <YesNoCheckbox {...register("penaltyEntry;create")} />
      </div>

      <div className="py-2 flex justify-between items-center gap-2 mt-2">
        <div>
          <h4 className="font-bold">Löschen</h4>
          <p className="text-sm">
            Citizen mit dieser Berechtigung können Strafpunkte bei anderen
            Citizen löschen. Dies sollte nur in Ausnahmefällen verwendet werden.
            Wenn Strafpunkte selbstständig ablaufen sollen, sollte stattdessen
            für den Eintrag ein Verfallsdatum angegeben werden.
          </p>
        </div>

        <YesNoCheckbox {...register("penaltyEntry;delete")} />
      </div>
    </TabPanel>
  );
};
