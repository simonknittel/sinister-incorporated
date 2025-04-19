"use client";

import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import TabPanel from "@/common/components/tabs/TabPanel";
import { usePermissionsContext } from "../PermissionsContext";

interface Props {
  readonly enableOperations: boolean;
}

const EventsTab = ({ enableOperations }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="events">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Events einsehen</h4>

        <YesNoCheckbox {...register("event;read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Events verwalten</h4>

        <YesNoCheckbox {...register("event;manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Event-Flotte einsehen</h4>

        <YesNoCheckbox {...register("eventFleet;read")} />
      </div>

      <div className="py-2 flex justify-between items-center gap-2">
        <div>
          <h4 className="font-bold">Aufstellung - Posten verwalten</h4>
          <p className="text-sm">
            Citizen mit dieser Berechtigung können die Posten der
            Eventaufstellung bearbeiten, selbst wenn sie nicht Organisator des
            Events sind.
          </p>
        </div>

        <YesNoCheckbox {...register("othersEventPosition;manage")} />
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
