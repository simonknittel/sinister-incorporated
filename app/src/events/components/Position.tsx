import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import {
  type Entity,
  type EventPosition,
  type EventPositionApplication,
  type Manufacturer,
  type Series,
  type Ship,
  type Upload,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CreateOrUpdateEventPosition } from "./CreateOrUpdateEventPosition";
import { DeleteEventPosition } from "./DeleteEventPosition";
import { EditablePositionName } from "./EditablePositionName";
import { useLineup } from "./LineupContext";
import { ToggleEventPositionApplicationForCurrentUser } from "./ToggleEventPositionApplicationForCurrentUser";
import { UpdateEventPositionCitizenId } from "./UpdateEventPositionCitizenId";

export type PositionType = EventPosition & {
  applications: (EventPositionApplication & {
    citizen: Entity;
  })[];
  requiredVariant:
    | (Variant & {
        series: Series & {
          manufacturer: Manufacturer & {
            image: Upload | null;
          };
        };
      })
    | null;
  citizen: Entity | null;
  childPositions?: PositionType[];
};

type Props = Readonly<{
  className?: string;
  position: PositionType;
  showManage?: boolean;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
  myShips: Ship[];
  allEventCitizens: { citizen: Entity; ships: Ship[] }[];
  showActions?: boolean;
  showToggle?: boolean;
  groupLevel: number;
}>;

export const Position = ({
  className,
  position,
  showManage,
  variants,
  myShips,
  allEventCitizens,
  showActions,
  showToggle,
  groupLevel,
}: Props) => {
  const authentication = useAuthentication();
  if (!authentication) throw new Error("Unauthorized");

  const { openPositions, open, close } = useLineup();
  const isOpen = openPositions.includes(position.id);

  const hasCurrentUserAlreadyApplied = position.applications.some(
    (application) => application.citizen.id === authentication.session.entityId,
  );

  const handleToggleOpen = () => {
    if (isOpen) {
      close(position.id);
    } else {
      open(position.id);
    }
  };

  let doesCurrentUserSatisfyRequirements = true;
  if (
    position.requiredVariant &&
    !myShips.find((ship) => ship.variantId === position.requiredVariantId)
  )
    doesCurrentUserSatisfyRequirements = false;

  let citizensSatisfyingRequirements = allEventCitizens;
  if (position.requiredVariant) {
    citizensSatisfyingRequirements = citizensSatisfyingRequirements.filter(
      (citizen) =>
        citizen.ships.some(
          (ship) => ship.variantId === position.requiredVariantId,
        ),
    );
  }
  const citizensNotSatisfyingRequirements = allEventCitizens.filter(
    (citizen) =>
      !citizensSatisfyingRequirements.some(
        (c) => c.citizen.id === citizen.citizen.id,
      ),
  );

  const applicationsSatisfyingRequirements = position.applications.filter(
    (application) =>
      citizensSatisfyingRequirements.some(
        (citizen) => citizen.citizen.id === application.citizen.id,
      ),
  );
  const applicationsNotSatisfyingRequirements = position.applications.filter(
    (application) =>
      citizensNotSatisfyingRequirements.some(
        (citizen) => citizen.citizen.id === application.citizen.id,
      ),
  );

  return (
    <div className={clsx(className)}>
      <div
        className={clsx(
          "flex items-stretch gap-2 p-2 sm:pl-4 bg-neutral-800/50",
          {
            "bg-neutral-800/70 rounded-t": isOpen,
            "rounded-b": !isOpen,
          },
        )}
      >
        <div className="flex-1 flex flex-col xl:grid xl:grid-cols-[1fr_256px_256px] gap-2">
          <div className="flex flex-col justify-center overflow-hidden">
            <h3
              className={clsx("text-sm text-gray-500", {
                "sr-only": !isOpen,
              })}
            >
              Name
            </h3>

            {showManage ? (
              <EditablePositionName
                positionId={position.id}
                name={position.name}
                className="font-bold"
              />
            ) : (
              <p className="overflow-hidden whitespace-nowrap text-ellipsis font-bold">
                {position.name}
              </p>
            )}
          </div>

          <div className="flex flex-col justify-center">
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
              <p className="text-neutral-500">-</p>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <h3
              className={clsx("text-sm text-gray-500", {
                "sr-only": !isOpen,
              })}
            >
              Citizen
            </h3>

            {showManage ? (
              <UpdateEventPositionCitizenId
                position={position}
                className="mt-1"
                citizensSatisfyingRequirements={citizensSatisfyingRequirements}
                citizensNotSatisfyingRequirements={
                  citizensNotSatisfyingRequirements
                }
                applicationsSatisfyingRequirements={
                  applicationsSatisfyingRequirements
                }
                applicationsNotSatisfyingRequirements={
                  applicationsNotSatisfyingRequirements
                }
              />
            ) : position.citizen ? (
              <Link
                href={`/app/spynet/citizen/${position.citizen.id}`}
                className={clsx("hover:underline self-start", {
                  "text-green-500":
                    position.citizen.id === authentication.session.entityId,
                  "text-sinister-red-500":
                    position.citizen.id !== authentication.session.entityId,
                })}
                prefetch={false}
              >
                {position.citizen.handle}
              </Link>
            ) : (
              <p className="text-neutral-500">-</p>
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
        <div className="bg-neutral-800/50 border-t border-white/10 rounded-b">
          <div className="p-4 flex gap-2">
            <div className="flex-1 flex flex-col">
              <h3 className="text-sm text-gray-500">Beschreibung</h3>
              {position.description ? (
                <p>{position.description}</p>
              ) : (
                <p className="text-neutral-500">-</p>
              )}
            </div>

            {/* TODO: Implement (multiple) role requirements */}
            {/* <div className="flex-1 flex flex-col">
              <h3 className="text-sm text-gray-500">
                Erforderliche Ränge/Zertifikate
              </h3>
              <p>-</p>
            </div> */}
          </div>

          {showActions && (showToggle || showManage) && (
            <div className="flex flex-row-reverse justify-between border-t border-white/10 p-4">
              <div className="justify-self-end">
                {showToggle && (
                  <ToggleEventPositionApplicationForCurrentUser
                    position={position}
                    hasCurrentUserAlreadyApplied={hasCurrentUserAlreadyApplied}
                    doesCurrentUserSatisfyRequirements={
                      doesCurrentUserSatisfyRequirements
                    }
                  />
                )}
              </div>

              {showManage && (
                <div className="flex items-center justify-center gap-2">
                  {groupLevel < 4 && (
                    <CreateOrUpdateEventPosition
                      eventId={position.eventId}
                      parentPositionId={position.id}
                      variants={variants}
                      className="flex-none"
                    />
                  )}
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
          )}
        </div>
      )}

      {position.childPositions && position.childPositions.length > 0 && (
        <div className="flex flex-col gap-[1px] pl-4 lg:pl-8 mt-[1px]">
          {position.childPositions
            .toSorted((a, b) => a.name.localeCompare(b.name))
            .map((position) => (
              <Position
                key={position.id}
                position={position}
                showManage={showManage}
                variants={variants}
                myShips={myShips}
                allEventCitizens={allEventCitizens}
                showActions={showActions}
                showToggle={showToggle}
                groupLevel={groupLevel + 1}
              />
            ))}
        </div>
      )}
    </div>
  );
};
