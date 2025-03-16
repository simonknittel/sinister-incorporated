import { requireAuthentication } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import clsx from "clsx";
import { getSilcTransactionsOfAllCitizens } from "../queries";
import { SilcTransactionsTableClient } from "./SilcTransactionsTableClient";

type Props = Readonly<{
  className?: string;
}>;

export const AllSilcTransactionsTable = async ({ className }: Props) => {
  const authentication = await requireAuthentication();

  const entries = await getSilcTransactionsOfAllCitizens();
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
