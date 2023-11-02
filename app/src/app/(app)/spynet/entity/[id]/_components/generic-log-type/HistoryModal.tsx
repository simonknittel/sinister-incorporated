"use client";

import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import { type PermissionSet } from "~/app/_lib/auth/PermissionSet";
import useAuthentication from "~/app/_lib/auth/useAuthentication";
import { type EntityLogType } from "~/types";
import { Create } from "./Create";
import { HistoryEntry } from "./HistoryEntry";

interface Props {
  type: EntityLogType;
  permissionResource: PermissionSet["resource"];
  entity: Entity;
  logs: (EntityLog & {
    attributes: (EntityLogAttribute & { createdBy: User })[];
    submittedBy: User;
  })[];
}

export const HistoryModal = ({
  type,
  permissionResource,
  entity,
  logs,
}: Readonly<Props>) => {
  const [isOpen, setIsOpen] = useState(false);
  const authentication = useAuthentication();

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        title="Bearbeiten"
      >
        <FaHistory /> History
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[768px]"
      >
        <h2 className="text-xl font-bold">History</h2>

        {authentication &&
          authentication.authorize([
            {
              resource: permissionResource,
              operation: "create",
            },
          ]) && <Create type={type} entity={entity} />}

        {logs.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-4">
            {logs.map((discordId) => (
              <HistoryEntry
                key={discordId.id}
                type={type}
                permissionResource={permissionResource}
                log={discordId}
              />
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 italic mt-8">
            Keine Einträge vorhanden
          </p>
        )}
      </Modal>
    </>
  );
};
