import { requireAuthentication } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { getSilcTransactionsOfCitizen } from "../queries";
import { SilcTransactionsTableClient } from "./SilcTransactionsTableClient";

interface Props {
  readonly className?: string;
  readonly citizenId: Entity["id"];
}

export const SilcTransactionsTable = async ({
  className,
  citizenId,
}: Props) => {
  const authentication = await requireAuthentication();

  const entries = await getSilcTransactionsOfCitizen(citizenId);
  const hasEntries = entries.length > 0;

  const [showEdit, showDelete] = await Promise.all([
    authentication.authorize("silcTransactionOfOtherCitizen", "update"),
    authentication.authorize("silcTransactionOfOtherCitizen", "delete"),
  ]);

  return (
    <Tile heading="Transaktionen" className={clsx(className)}>
      {hasEntries ? (
        <SilcTransactionsTableClient
          rows={entries}
          showEdit={showEdit}
          showDelete={showDelete}
        />
      ) : (
        <p className="italic">Bisher wurden keine SILC verteilt.</p>
      )}
    </Tile>
  );
};
