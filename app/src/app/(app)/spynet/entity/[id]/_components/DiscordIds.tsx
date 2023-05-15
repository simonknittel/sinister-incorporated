"use client";

import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import Modal from "~/app/_components/Modal";
import AddDiscordId from "./AddDiscordId";
import Handle from "./Handle";

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
      <button
        onClick={() => setIsOpen(true)}
        className="text-sinister-red-500 hover:text-sinister-red-300 px-2"
        type="button"
        title="Bearbeiten"
      >
        <FaPen />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Frühere Discord IDs</h2>

        <AddDiscordId entity={entity} onRequestClose={() => setIsOpen(false)} />

        {discordIds.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {discordIds.map((handle) => (
              <Handle key={handle.id} handle={handle} />
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
