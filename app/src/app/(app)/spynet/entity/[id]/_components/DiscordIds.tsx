"use client";

import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import Button from "~/app/_components/Button";
import Modal from "~/app/_components/Modal";
import AddDiscordId from "./AddDiscordId";
import SingleDiscordId from "./SingleDiscordId";

interface Props {
  entity: Entity & {
    logs: (EntityLog & {
      attributes: EntityLogAttribute[];
    })[];
  };
}

const DiscordIds = ({ entity }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const discordIds = entity.logs
    .filter((log) => log.type === "discord-id")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="tertiary"
        title="Bearbeiten"
      >
        <FaPen /> Bearbeiten
      </Button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Frühere Discord IDs</h2>

        <AddDiscordId entity={entity} />

        {discordIds.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {discordIds.map((discordId) => (
              <SingleDiscordId key={discordId.id} log={discordId} />
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 italic mt-4">
            Keine früheren Discord IDs bekannt.
          </p>
        )}
      </Modal>
    </>
  );
};

export default DiscordIds;
