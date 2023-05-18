"use client";

import { type Permission, type Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import { permissionGroups } from "../_utils/permissionGroups";
import PermissionCheckbox from "./PermissionCheckbox";

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
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Berechtigungen bearbeiten</h2>

        {permissionGroups.map((permissionGroup) => {
          return (
            <div key={permissionGroup.name} className="mt-4">
              <h3 className="flex items-center gap-2 text-neutral-500 py-2">
                {permissionGroup.icon}
                {permissionGroup.name}
              </h3>

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
                      (rolePermission) => rolePermission.key === permission.key
                    )}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </Modal>
    </>
  );
};

export default RolePermissions;
