"use client";

import { type Permission, type Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import { permissionGroups } from "../_utils/permissionGroups";
import PermissionCheckbox from "./PermissionCheckbox";
import Tab from "./Tab";
import TabPanel from "./TabPanel";
import { TabsProvider } from "./TabsContext";

interface Props {
  role: Role & { permissions: Permission[] };
}

const RolePermissions = ({ role }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRequestClose = () => {
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <FaPen /> Berechtigungen
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[960px] h-full"
      >
        <h2 className="text-xl font-bold">Berechtigungen bearbeiten</h2>

        <TabsProvider initialActiveTab={permissionGroups[0]?.name}>
          <div className="flex mt-4 flex-wrap">
            {permissionGroups.map((permissionGroup) => (
              <Tab key={permissionGroup.name} tab={permissionGroup.name}>
                {permissionGroup.icon} {permissionGroup.name}
              </Tab>
            ))}
          </div>

          <div className="mt-4">
            {permissionGroups.map((permissionGroup) => {
              return (
                <TabPanel key={permissionGroup.name} tab={permissionGroup.name}>
                  {permissionGroup.permissions.map((permission) => (
                    <div
                      key={`${permissionGroup.name}_${permission.key}`}
                      className="py-2 flex justify-between items-center"
                    >
                      <span>{permission.name}</span>

                      <PermissionCheckbox
                        permission={permission}
                        role={role}
                        checked={role.permissions.some(
                          (rolePermission) =>
                            rolePermission.key === permission.key &&
                            rolePermission.value === "true"
                        )}
                      />
                    </div>
                  ))}
                </TabPanel>
              );
            })}
          </div>
        </TabsProvider>
      </Modal>
    </>
  );
};

export default RolePermissions;
