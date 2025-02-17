import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import {
  type Entity,
  type EventPosition,
  type EventPositionApplication,
  type Manufacturer,
  type Series,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import { DeleteEventPosition } from "./DeleteEventPosition";
import { UpdateEventPositionAcceptedApplication } from "./UpdateEventPositionAcceptedApplication";

type Props = Readonly<{
  className?: string;
  position: EventPosition & {
    applications: (EventPositionApplication & {
      citizen: Entity;
    })[];
    acceptedApplication:
      | (EventPositionApplication & {
          citizen: Entity;
        })
      | null;
    requiredVariant?: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
  showManage?: boolean;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}>;

export const Position = ({
  className,
  position,
  showManage,
  variants,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div
      className={clsx(
        "rounded bg-neutral-800/50",
        {
          "mb-2": isOpen,
        },
        className,
      )}
    >
      <div className="flex items-stretch gap-2 p-2">
        <div className="flex-1 flex flex-col justify-center pl-2">
          <h3
            className={clsx("text-sm text-gray-500", {
              "sr-only": !isOpen,
            })}
          >
            Name
          </h3>
          <p>{position.name}</p>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3
            className={clsx("text-sm text-gray-500", {
              "sr-only": !isOpen,
            })}
          >
            Schiff
          </h3>
          {position.requiredVariant ? (
            <VariantWithLogo
              variant={position.requiredVariant}
              manufacturer={position.requiredVariant.series.manufacturer}
              size={32}
            />
          ) : (
            <p>-</p>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3
            className={clsx("text-sm text-gray-500", {
              "sr-only": !isOpen,
            })}
          >
            Citizen
          </h3>

          {showManage ? (
            <UpdateEventPositionAcceptedApplication
              position={position}
              className="mt-1"
            />
          ) : position.acceptedApplication ? (
            <Link
              href={`/app/spynet/citizen/${position.acceptedApplication.citizen.id}`}
              className="text-sinister-red-500 hover:underline self-start"
              prefetch={false}
            >
              {position.acceptedApplication.citizen.handle}
            </Link>
          ) : (
            <p>-</p>
          )}
        </div>

        <button
          onClick={handleToggleOpen}
          title={isOpen ? "Details schließen" : "Details öffnen"}
          className="flex-none p-3 flex items-center justify-center border-l border-white/10 hover:bg-neutral-800 rounded"
        >
          {isOpen ? (
            <FaChevronUp className="text-sinister-red-500" />
          ) : (
            <FaChevronDown className="text-sinister-red-500" />
          )}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 flex gap-2 border-t border-white/10">
          <div className="flex-1 flex flex-col">
            <h3 className="text-sm text-gray-500">Beschreibung</h3>
            <p>{position.description || "-"}</p>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="text-sm text-gray-500">
              Erforderliche Ränge/Zertifikate
            </h3>
            <p>-</p>
          </div>

          {showManage && (
            <div className="flex-initial w-12 flex items-center justify-center gap-2">
              <CreateOrUpdateEventPosition
                position={position}
                variants={variants}
              />
              <DeleteEventPosition position={position} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
