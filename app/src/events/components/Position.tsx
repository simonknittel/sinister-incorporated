import type { EventPosition, EventPositionApplication } from "@prisma/client";
import clsx from "clsx";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { DeleteEventPosition } from "./DeleteEventPosition";

type Props = Readonly<{
  className?: string;
  position: EventPosition & {
    applications: EventPositionApplication[];
  };
  showDelete?: boolean;
}>;

export const Position = ({ className, position, showDelete }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={clsx(className)}>
      <button
        onClick={handleToggleOpen}
        className={clsx(
          "w-full text-left flex gap-2 p-2 hover:bg-neutral-800 rounded",
          {
            "bg-neutral-950": isOpen,
          },
        )}
        title={isOpen ? "Details schließen" : "Details öffnen"}
      >
        <div className="flex-1 flex flex-col">
          <h3 className="text-sm text-gray-500">Name</h3>
          <p>{position.name}</p>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-sm text-gray-500">Schiff</h3>
          <p>-</p>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="text-sm text-gray-500">Citizen</h3>
          <p>-</p>
        </div>

        <div className="flex-initial w-6 flex items-center justify-center">
          <div className="text-sinister-red-500">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="px-2 pt-2 pb-6 flex gap-2">
          <div className="flex-1 flex flex-col">
            <h3 className="text-sm text-gray-500">Beschreibung</h3>
            <p>{position.description || "-"}</p>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-sm text-gray-500">Ränge/Zertifikate</h3>
            <p>-</p>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-sm text-gray-500">Interessierte</h3>
            <p>-</p>
          </div>

          <div className="flex-initial w-6 flex items-center justify-center">
            {showDelete && <DeleteEventPosition position={position} />}
          </div>
        </div>
      )}
    </div>
  );
};
