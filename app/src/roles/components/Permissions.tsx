"use client";

import Button from "@/common/components/Button";
import Note from "@/common/components/Note";
import Tab from "@/common/components/tabs/Tab";
import TabList from "@/common/components/tabs/TabList";
import { TabsProvider } from "@/common/components/tabs/TabsContext";
import {
  type ClassificationLevel,
  type NoteType,
  type Role,
} from "@prisma/client";
import clsx from "clsx";
import { useActionState } from "react";
import { FaCalendarDay, FaCog, FaSave, FaSpinner } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import { updateRolePermissions } from "../actions/updateRolePermissions";
import { usePermissionsContext } from "./PermissionsContext";
import { CitizenTab } from "./tabs/CitizenTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import EventsTab from "./tabs/EventsTab";
import FleetTab from "./tabs/FleetTab";
import { OrganizationsTab } from "./tabs/OrganizationsTab";
import OtherTab from "./tabs/OtherTab";

type Props = Readonly<{
  role: Role;
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
  allRoles: Role[];
  enableOperations: boolean;
}>;

export const Permissions = ({
  role,
  noteTypes,
  classificationLevels,
  allRoles,
  enableOperations,
}: Props) => {
  const { permissionStrings } = usePermissionsContext();
  const [state, formAction, isPending] = useActionState(
    updateRolePermissions,
    null,
  );

  return (
    <>
      <TabsProvider initialActiveTab="citizen">
        <TabList>
          <Tab id="citizen">
            <RiSpyFill /> Citizen
          </Tab>

          <Tab id="organizations">
            <RiSpyFill /> Organisationen
          </Tab>

          <Tab id="fleet">
            <MdWorkspaces /> Flotte
          </Tab>

          <Tab id="events">
            <FaCalendarDay /> Events
          </Tab>

          <Tab id="documents">
            <FaCog /> Dokumente
          </Tab>

          <Tab id="other">
            <FaCog /> Sonstiges
          </Tab>
        </TabList>

        <CitizenTab
          noteTypes={noteTypes}
          classificationLevels={classificationLevels}
        />
        <OrganizationsTab />
        <FleetTab />
        <EventsTab enableOperations={enableOperations} />
        <DocumentsTab />
        <OtherTab roles={allRoles} />
      </TabsProvider>

      <form action={formAction}>
        <input type="hidden" name="id" value={role.id} />

        <input
          type="hidden"
          name="permissionStrings"
          value={JSON.stringify(permissionStrings)}
        />

        <Button type="submit" disabled={isPending} className="mt-4 ml-auto">
          {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
          Speichern
        </Button>

        {state && (
          <Note
            type={state.success ? "success" : "error"}
            message={state.success ? state.success : state.error}
            className={clsx("mt-4", {
              "animate-pulse": isPending,
            })}
          />
        )}
      </form>
    </>
  );
};
