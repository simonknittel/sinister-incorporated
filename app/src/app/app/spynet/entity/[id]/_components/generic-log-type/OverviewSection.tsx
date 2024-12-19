import { requireAuthentication } from "@/auth/server";
import { type Entity } from "@prisma/client";
import { camelCase } from "change-case";
import { type ReactNode } from "react";
import { type GenericEntityLogType } from "../../../../../../../types";
import { HistoryModal } from "./HistoryModal";

interface Props {
  type: GenericEntityLogType;
  icon?: ReactNode;
  name: string;
  entity: Entity;
}

export const OverviewSection = async ({
  type,
  icon,
  name,
  entity,
}: Readonly<Props>) => {
  await requireAuthentication();

  return (
    <>
      <dt className="text-neutral-500 mt-4 flex gap-2 items-center">
        {icon} {name}
      </dt>

      <dd className="flex gap-4 items-center">
        <span className="whitespace-nowrap overflow-hidden text-ellipsis">
          {entity[camelCase(type)] || <span className="italic">Unbekannt</span>}
        </span>

        <HistoryModal type={type} entity={entity} />
      </dd>
    </>
  );
};
