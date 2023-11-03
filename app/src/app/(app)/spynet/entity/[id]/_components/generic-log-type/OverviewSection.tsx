import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
} from "@prisma/client";
import { type ReactNode } from "react";
import { prisma } from "scripts/prisma";
import { authenticate } from "~/app/_lib/auth/authenticateAndAuthorize";
import { type GenericEntityLogType } from "~/types";
import { HistoryModal } from "./HistoryModal";

interface Props {
  type: GenericEntityLogType;
  icon?: ReactNode;
  name: string;
  entity: Entity & {
    logs: (EntityLog & { attributes: EntityLogAttribute[] })[];
  };
}

export const OverviewSection = async ({
  type,
  icon,
  name,
  entity,
}: Readonly<Props>) => {
  const authentication = await authenticate();
  if (!authentication) return null;

  const confirmedLog = await prisma.entityLog.findFirst({
    where: {
      entityId: entity.id,
      type: type,
      attributes: {
        some: {
          key: "confirmed",
          value: "confirmed",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <>
      <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
        {icon} {name}
      </dt>

      <dd className="flex gap-4 items-center">
        {confirmedLog?.content || <span className="italic">Unbekannt</span>}

        <HistoryModal type={type} entity={entity} />
      </dd>
    </>
  );
};
