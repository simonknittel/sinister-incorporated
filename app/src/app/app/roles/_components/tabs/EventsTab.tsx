"use client";

import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import TabPanel from "../../../../_components/tabs/TabPanel";
import { usePermissionsContext } from "../PermissionsContext";

type Props = Readonly<{
  enableOperations: boolean;
}>;

const EventsTab = ({ enableOperations }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="events">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Events einsehen</h4>

        <YesNoCheckbox {...register("event;read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Event-Flotte einsehen</h4>

        <YesNoCheckbox {...register("eventFleet;read")} />
      </div>

      {enableOperations && (
        <div className="py-2 flex justify-between items-center">
          <h4 className="font-bold">Operationen verwalten</h4>

          <YesNoCheckbox {...register("operation;manage")} />
        </div>
      )}
    </TabPanel>
  );
};

export default EventsTab;
