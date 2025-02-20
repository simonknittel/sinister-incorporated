import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import {
  type Entity,
  type EventPosition,
  type EventPositionApplication,
  type Manufacturer,
  type Series,
  type Ship,
  type Variant,
} from "@prisma/client";
import { useLocalStorage } from "@uidotdev/usehooks";
import clsx from "clsx";
import Link from "next/link";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import { DeleteEventPosition } from "./DeleteEventPosition";
import { ToggleEventPositionApplicationForCurrentUser } from "./ToggleEventPositionApplicationForCurrentUser";
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
  myShips: Ship[];
  allEventCitizen: Entity[];
}>;

export const Position = ({
  className,
  position,
  showManage,
  variants,
  myShips,
  allEventCitizen,
}: Props) => {
  const [isOpen, setIsOpen] = useLocalStorage(
    `position_${position.id}.isopen`,
    false,
  );
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const hasCurrentUserAlreadyApplied = position.applications.some(
    (application) => application.citizen.id === authentication.session.entityId,
  );

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  let doesCurrentUserSatisfyRequirements = true;
  if (
    position.requiredVariant &&
    !myShips.find((ship) => ship.variantId === position.requiredVariantId)
  )
    doesCurrentUserSatisfyRequirements = false;

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
      <div
        className={clsx("flex items-stretch gap-2 p-2 sm:pl-4", {
          "bg-neutral-800/50": isOpen,
        })}
      >
        <div className="flex-1 flex flex-col sm:flex-row items-stretch gap-2">
          <div className="flex-1 flex flex-col justify-center overflow-hidden">
            <h3
              className={clsx("text-sm text-gray-500", {
                "sr-only": !isOpen,
              })}
            >
              Name
            </h3>
            <p className="overflow-hidden whitespace-nowrap text-ellipsis font-bold">
              {position.name}
            </p>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <h3
              className={clsx("text-sm text-gray-500", {
                "sr-only": !isOpen,
              })}
            >
              Erforderliches Schiff
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
                eventCitizenSatisfyingRequirements={[]}
                eventCitizenNotSatisfyingRequirements={allEventCitizen}
              />
            ) : position.acceptedApplication ? (
              <Link
                href={`/app/spynet/citizen/${position.acceptedApplication.citizen.id}`}
                className={clsx("hover:underline self-start", {
                  "text-green-500":
                    position.acceptedApplication.citizen.id ===
                    authentication.session.entityId,
                  "text-sinister-red-500":
                    position.acceptedApplication.citizen.id !==
                    authentication.session.entityId,
                })}
                prefetch={false}
              >
                {position.acceptedApplication.citizen.handle}
              </Link>
            ) : (
              <p>-</p>
            )}
          </div>
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
        <div className="border-t border-white/10">
          <div className="p-4 flex gap-2">
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm text-gray-500">Beschreibung</h3>
              <p>{position.description || "-"}</p>
            </div>

            {/* TODO: Implement (multiple) role requirements */}
            {/* <div className="flex-1 flex flex-col">
              <h3 className="text-sm text-gray-500">
                Erforderliche Ränge/Zertifikate
              </h3>
              <p>-</p>
            </div> */}
          </div>

          <div className="flex flex-row-reverse justify-between border-t border-white/10 p-4">
            <div className="justify-self-end">
              <ToggleEventPositionApplicationForCurrentUser
                position={position}
                hasCurrentUserAlreadyApplied={hasCurrentUserAlreadyApplied}
                doesCurrentUserSatisfyRequirements={
                  doesCurrentUserSatisfyRequirements
                }
              />
            </div>

            {showManage && (
              <div className="flex items-center justify-center gap-2">
                <CreateOrUpdateEventPosition
                  position={position}
                  variants={variants}
                  className="flex-none"
                />
                <DeleteEventPosition
                  position={position}
                  className="flex-none"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
