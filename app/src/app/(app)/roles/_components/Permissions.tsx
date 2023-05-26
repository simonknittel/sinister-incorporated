"use client";

import {
  type ClassificationLevel,
  type NoteType,
  type Permission,
  type PermissionAttribute,
  type Role,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, type SubmitHandler } from "react-hook-form";
import toast from "react-hot-toast";
import { FaCalendarDay, FaCog, FaPen, FaSave, FaSpinner } from "react-icons/fa";
import { MdWorkspaces } from "react-icons/md";
import { RiSpyFill, RiSwordFill } from "react-icons/ri";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import Tab from "~/app/_components/tabs/Tab";
import TabList from "~/app/_components/tabs/TabList";
import { TabsProvider } from "~/app/_components/tabs/TabsContext";
import { type FormValues } from "~/app/_lib/auth/FormValues";
import databaseRoleToFormValues from "~/app/_lib/auth/databaseRoleToFormValues";
import EventsTab from "./tabs/EventsTab";
import FleetTab from "./tabs/FleetTab";
import OperationsTab from "./tabs/OperationsTab";
import OtherTab from "./tabs/OtherTab";
import SpynetTab from "./tabs/SpynetTab";

interface Props {
  role: Role & {
    permissions: (Permission & { attributes: PermissionAttribute[] })[];
  };
  noteTypes: NoteType[];
  classificationLevels: ClassificationLevel[];
  allRoles: Role[];
}

const Permissions = ({
  role,
  noteTypes,
  classificationLevels,
  allRoles,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const methods = useForm<FormValues>({
    defaultValues: databaseRoleToFormValues(role),
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestClose = () => {
    setIsOpen(false);
    router.refresh();
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/role/${role.id}/permissions`, {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Erfolgreich gespeichert");
      } else {
        toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      }
    } catch (error) {
      toast.error("Beim Speichern ist ein Fehler aufgetreten.");
      console.error(error);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <FaPen /> Berechtigungen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[960px] h-[1024px]"
      >
        <h2 className="text-xl font-bold mb-4">Berechtigungen</h2>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <TabsProvider initialActiveTab="spynet">
              <TabList>
                <Tab id="spynet">
                  <RiSpyFill /> Spynet
                </Tab>

                <Tab id="fleet">
                  <MdWorkspaces /> Flotte
                </Tab>

                <Tab id="operations">
                  <RiSwordFill /> Operationen
                </Tab>

                <Tab id="events">
                  <FaCalendarDay /> Events
                </Tab>

                <Tab id="other">
                  <FaCog /> Sonstiges
                </Tab>
              </TabList>

              <SpynetTab
                noteTypes={noteTypes}
                classificationLevels={classificationLevels}
              />
              <FleetTab />
              <OperationsTab />
              <EventsTab />
              <OtherTab roles={allRoles} />
            </TabsProvider>

            <div className="flex justify-end mt-8">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Speichern
              </Button>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default Permissions;
