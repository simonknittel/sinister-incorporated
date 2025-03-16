import { requireAuthentication } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import clsx from "clsx";
import { getSilcBalanceOfAllCitizens } from "../queries";
import { CreateOrUpdateSilcTransaction } from "./CreateOrUpdateSilcTransaction";
import { SilcBalancesTableClient } from "./SilcBalancesTableClient";

type Props = Readonly<{
  className?: string;
}>;

export const SilcBalancesTable = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  const showCreate = await authentication.authorize(
    "silcTransactionOfOtherCitizen",
    "create",
  );

  const entries = await getSilcBalanceOfAllCitizens();
  const hasEntries = entries.length > 0;

  return (
    <Tile
      heading="Übersicht"
      cta={showCreate ? <CreateOrUpdateSilcTransaction /> : null}
      className={clsx(className)}
    >
      {hasEntries ? (
        <SilcBalancesTableClient rows={entries} />
      ) : (
        <p className="italic">Bisher wurden keine SILC verteilt.</p>
      )}
    </Tile>
  );
};
