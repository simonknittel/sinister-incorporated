"use client";

import { useFormContext } from "react-hook-form";
import TabPanel from "~/app/_components/tabs/TabPanel";
import YesNoCheckbox from "../../../../../_components/YesNoCheckbox";
import { type FormValues } from "../../../../../_lib/auth/FormValues";

const OperationsTab = () => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="operations">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Operationen verwalten</h4>

        <YesNoCheckbox register={register("operation.manage")} />
      </div>
    </TabPanel>
  );
};

export default OperationsTab;
