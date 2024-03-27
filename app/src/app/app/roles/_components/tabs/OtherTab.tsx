"use client";

import { type Role } from "@prisma/client";
import { useFormContext } from "react-hook-form";
import { type FormValues } from "../../../../../lib/auth/FormValues";
import YesNoCheckbox from "../../../../_components/YesNoCheckbox";
import TabPanel from "../../../../_components/tabs/TabPanel";
import RoleSection from "./components/RoleSection";

interface Props {
  roles: Role[];
}

const OtherTab = ({ roles }: Readonly<Props>) => {
  const { register } = useFormContext<FormValues>();

  return (
    <TabPanel id="other">
      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Anmelden</h4>

        <YesNoCheckbox register={register("login.manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <div>
          <h4 className="font-bold">Gesperrt</h4>
          <p>Negiert Anmelden anderer Rollen</p>
        </div>

        <YesNoCheckbox register={register("login.negate")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Benutzer einsehen</h4>

        <YesNoCheckbox register={register("user.read")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Rollen inkl. Berechtigungen verwalten</h4>

        <YesNoCheckbox register={register("role.manage")} />
      </div>

      <div className="py-2 flex justify-between items-center">
        <h4 className="font-bold">Geheimhaltungsstufen verwalten</h4>

        <YesNoCheckbox register={register("classificationLevel.manage")} />
      </div>

      <RoleSection roles={roles} className="mt-4" />
    </TabPanel>
  );
};

export default OtherTab;
