"use client";

import TabPanel from "@/common/components/tabs/TabPanel";
import YesNoCheckbox from "@/common/components/YesNoCheckbox";
import { usePermissionsContext } from "../PermissionsContext";

const FleetTab = () => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="fleet">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Gesamte Flotte einsehen</h4>

        <YesNoCheckbox {...register("orgFleet;read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Eigene Schiffe verwalten</h4>

        <YesNoCheckbox {...register("ship;manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Schiffsmodelle verwalten</h4>

        <YesNoCheckbox {...register("manufacturersSeriesAndVariants;manage")} />
      </div>
    </TabPanel>
  );
};

export default FleetTab;
