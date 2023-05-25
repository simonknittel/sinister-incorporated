"use client";

import { useFormContext } from "react-hook-form";
import TabPanel from "~/app/_components/tabs/TabPanel";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";
import { type FormValues } from "../../../../../_lib/auth/FormValues";

const FleetTab = () => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="fleet">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Gesamte Flotte einsehen</h4>

        <YesNoCheckbox register={register("orgFleet.read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Eigene Schiffe verwalten</h4>

        <YesNoCheckbox register={register("ship.manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Schiffsmodelle verwalten</h4>

        <YesNoCheckbox
          register={register("manufacturersSeriesAndVariants.manage")}
        />
      </div>
    </TabPanel>
  );
};

export default FleetTab;
