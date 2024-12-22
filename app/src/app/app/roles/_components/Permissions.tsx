"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import Tab from "@/common/components/tabs/Tab";
import TabList from "@/common/components/tabs/TabList";
import { TabsProvider } from "@/common/components/tabs/TabsContext";
import {
  type ClassificationLevel,
  type NoteType,
  type Role,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarDay,
  FaCog,
  FaLock,
  FaSave,
  FaSpinner,
} from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill } from "react-icons/ri";
import { usePermissionsContext } from "./PermissionsContext";
import { CitizenTab } from "./tabs/CitizenTab";
import { DocumentsTab } from "./tabs/DocumentsTab";
import EventsTab from "./tabs/EventsTab";
import FleetTab from "./tabs/FleetTab";
import { OrganizationsTab } from "./tabs/OrganizationsTab";
import OtherTab from "./tabs/OtherTab";

type Props = Readonly<{
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
  allRoles: Role[];
  enableOperations: boolean;
}>;

export const Permissions = ({
  noteTypes,
  classificationLevels,
  allRoles,
  enableOperations,
}: Props) => {
  const { handleSubmit, isLoading } = usePermissionsContext();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRequestClose = () => {
    setIsOpen(false);
    router.refresh();
  };

  const _handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await handleSubmit(e);

      router.refresh();
      toast.success("Erfolgreich gespeichert");
    } catch (error) {
      toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      console.error(error);
    }
  };

  return (
    <>
      <Button variant="tertiary" onClick={() => setIsOpen(true)}>
        <FaLock /> Berechtigungen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[960px] h-[1024px]"
      >
        <h2 className="text-xl font-bold mb-4">Berechtigungen</h2>

        <form onSubmit={_handleSubmit}>
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

          <div className="flex justify-end mt-8">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
