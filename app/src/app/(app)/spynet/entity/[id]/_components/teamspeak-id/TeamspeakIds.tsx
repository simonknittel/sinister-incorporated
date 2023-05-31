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
import useAuthentication from "~/app/_lib/auth/useAuthentication";
import Create from "./Create";
import SingleTeamspeakId from "./SingleTeamspeakId";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
}

const TeamspeakIds = ({ entity }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const authentication = useAuthentication();

  // TODO: Do this server-side
  const teamspeakIds = entity.logs
    .filter((log) => log.type === "teamspeakId")
    .filter((log) => {
      const confirmed = log.attributes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .find((attribute) => attribute.key === "confirmed");

      if (confirmed && confirmed.value === "confirmed") return true;
      if (!authentication) return false;

      return authentication.authorize([
        {
          resource: "teamspeakId",
          operation: "confirm",
        },
      ]);
    })
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

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
              resource: "teamspeakId",
              operation: "create",
            },
          ]) && <Create entity={entity} />}

        {teamspeakIds.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-4">
            {teamspeakIds.map((teamspeakId) => (
              <SingleTeamspeakId key={teamspeakId.id} log={teamspeakId} />
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

export default TeamspeakIds;
