"use client";

import { useFormContext } from "react-hook-form";
import { type FormValues } from "../../../../../_lib/auth/FormValues";
import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import TabPanel from "../../../../_components/tabs/TabPanel";

const EventsTab = () => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="events">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Events einsehen</h4>

        <YesNoCheckbox register={register("event.read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Event-Flotte einsehen</h4>

        <YesNoCheckbox register={register("eventFleet.read")} />
      </div>
    </TabPanel>
  );
};

export default EventsTab;
