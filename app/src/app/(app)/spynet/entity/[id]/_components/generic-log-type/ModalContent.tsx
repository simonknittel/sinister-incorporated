"use client";

import { type Entity } from "@prisma/client";
import useAuthentication from "~/_lib/auth/useAuthentication";
import { api } from "~/trpc/react";
import { type GenericEntityLogType } from "~/types";
import { Create } from "./Create";
import { HistoryEntry } from "./HistoryEntry";
import { HistoryEntrySkelton } from "./HistoryEntrySkeleton";

interface Props {
  type: GenericEntityLogType;
  entity: Entity;
}

export const ModalContent = ({ type, entity }: Readonly<Props>) => {
  const authentication = useAuthentication();

  const history = api.entityLog.getHistory.useQuery({
    type,
    entityId: entity.id,
  });

  let entries;
  if (!history.data && history.isLoading) {
    entries = <HistoryEntrySkelton />;
  } else if (history.data && history.data.length > 0) {
    entries = (
      <ul className="mt-8 flex flex-col gap-4">
        {history.data.map((log) => (
          <HistoryEntry key={log.id} type={type} log={log} />
        ))}
      </ul>
    );
  } else {
    entries = (
      <p className="text-neutral-500 italic mt-8">Keine Einträge vorhanden</p>
    );
  }

  return (
    <>
      <h2 className="text-xl font-bold">History</h2>

      {authentication &&
        authentication.authorize([
          {
            resource: type,
            operation: "create",
          },
        ]) && <Create type={type} entity={entity} />}

      {entries}
    </>
  );
};
