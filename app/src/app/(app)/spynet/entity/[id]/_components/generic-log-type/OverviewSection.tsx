import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { type ReactNode } from "react";
import { prisma } from "scripts/prisma";
import { type PermissionSet } from "~/app/_lib/auth/PermissionSet";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { type EntityLogType } from "~/types";
import { HistoryModal } from "./HistoryModal";

interface Props {
  type: EntityLogType;
  permissionResource: PermissionSet["resource"];
  icon?: ReactNode;
  name: string;
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  };
}

export const OverviewSection = async ({
  type,
  permissionResource,
  icon,
  name,
  entity,
}: Readonly<Props>) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const allLogs = await prisma.entityLog.findMany({
    where: {
      entityId: entity.id,
      type: type,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      attributes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: true,
        },
      },
      submittedBy: true,
    },
  });

  const filteredLogs = allLogs.filter((log) => {
    const confirmed = log.attributes.find(
      (attribute) => attribute.key === "confirmed",
    );

    if (confirmed && confirmed.value === "confirmed") return true;

    return authentication.authorize([
      {
        resource: permissionResource,
        operation: "confirm",
      },
    ]);
  });

  const confirmedLog = allLogs.find((log) => {
    return log.attributes.find(
      (attribute) =>
        attribute.key === "confirmed" && attribute.value === "confirmed",
    );
  });

  return (
    <>
      <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
        {icon} {name}
      </dt>

      <dd className="flex gap-4 items-center">
        {confirmedLog?.content || <span className="italic">Unbekannt</span>}

        <HistoryModal
          type={type}
          permissionResource={permissionResource}
          entity={entity}
          logs={filteredLogs}
        />
      </dd>
    </>
  );
};
