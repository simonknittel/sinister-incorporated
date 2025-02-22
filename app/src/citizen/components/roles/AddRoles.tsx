"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { env } from "@/env";
import { type Entity, type Role, type Upload } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import RoleCheckbox from "./RoleCheckbox";

type Props = Readonly<{
  className?: string;
  entity: Entity;
  allRoles: (Role & {
    icon: Upload | null;
  })[];
  assignedRoleIds: Role["id"][];
  iconOnly?: boolean;
}>;

export const AddRoles = ({
  className,
  entity,
  allRoles,
  assignedRoleIds,
  iconOnly = false,
}: Props) => {
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
        title="Bearbeiten"
      >
        <FaPen /> {!iconOnly && <>Bearbeiten</>}
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold mb-4">Bearbeiten</h2>

        {allRoles.map((role) => (
          <div key={role.id} className="py-2 flex justify-between items-center">
            <span className="flex gap-2 items-center">
              {role.icon && (
                <div className="aspect-square w-6 h-6 flex items-center justify-center rounded overflow-hidden">
                  <Image
                    src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.icon.id}`}
                    alt=""
                    width={24}
                    height={24}
                    className="max-w-full max-h-full"
                    unoptimized={["image/svg+xml", "image/gif"].includes(
                      role.icon.mimeType,
                    )}
                  />
                </div>
              )}
              {role.name}
            </span>

            <RoleCheckbox
              entity={entity}
              role={role}
              checked={assignedRoleIds.includes(role.id)}
            />
          </div>
        ))}
      </Modal>
    </>
  );
};
