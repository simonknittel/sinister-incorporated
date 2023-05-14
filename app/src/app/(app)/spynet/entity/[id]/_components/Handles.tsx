"use client";

import { type Entity, type EntityLog } from "@prisma/client";
import { useState } from "react";
import { FaHistory } from "react-icons/fa";
import { TbCircleDot } from "react-icons/tb";
import Modal from "~/app/_components/Modal";
import AddHandle from "./AddHandle";

interface Props {
  entity: Entity & {
    logs: EntityLog[];
  };
}

const Handles = ({ entity }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handles = entity.logs
    .filter((log) => log.type === "handle")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-sinister-red-500 hover:text-sinister-red-300 px-2"
        type="button"
        title="Frühere Handles"
      >
        <FaHistory />
      </button>

      <Modal
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">Frühere Handles</h2>

        <AddHandle entity={entity} />

        {handles.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {handles.map((handle, index) => (
              <li key={handle.id} className="flex gap-2">
                <div className="h-[24px] flex items-center">
                  <TbCircleDot />
                </div>

                <div className="flex-1">
                  <p>{handle.content}</p>

                  <p className="text-neutral-500 text-sm">
                    {index <= 0 && "Aktuell seit "}
                    <time dateTime={handle.createdAt.toISOString()}>
                      {handle.createdAt.toLocaleDateString("de-DE")}
                    </time>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-neutral-500 italic mt-4">
            Keine früheren Handles bekannt.
          </p>
        )}
      </Modal>
    </>
  );
};

export default Handles;
