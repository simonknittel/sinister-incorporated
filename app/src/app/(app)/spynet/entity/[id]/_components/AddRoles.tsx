"use client";

import { type Entity, type Role } from "@prisma/client";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import RoleCheckbox from "./RoleCheckbox";

interface Props {
  className?: string;
  entity: Entity;
  roles: Role[];
  activeRolesIds: Role["id"][];
}

const AddRoles = ({ className, entity, roles, activeRolesIds }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleRequestClose = () => {
    setIsOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button
        variant="tertiary"
        onClick={() => setIsOpen(true)}
        className={clsx(className)}
      >
        <FaPen /> Bearbeiten
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold mb-4">Rollen bearbeiten</h2>

        {roles.map((role) => (
          <div key={role.id} className="py-2 flex justify-between items-center">
            <span>{role.name}</span>

            <RoleCheckbox
              entity={entity}
              role={role}
              checked={activeRolesIds.includes(role.id)}
            />
          </div>
        ))}
      </Modal>
    </>
  );
};

export default AddRoles;
