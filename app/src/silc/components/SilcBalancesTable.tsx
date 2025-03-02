import { requireAuthentication } from "@/auth/server";
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
    <section className={clsx("rounded-2xl bg-neutral-800/50", className)}>
      <div className="border-b border-white/5 flex justify-between items-center">
        <h2 className="font-bold text-xl p-4 lg:px-8">Übersicht</h2>

        {showCreate && (
          <div className="pr-4 lg:pr-8">
            <CreateOrUpdateSilcTransaction />
          </div>
        )}
      </div>

      <div className="p-4 lg:p-8">
        {hasEntries ? (
          <SilcBalancesTableClient rows={entries} />
        ) : (
          <p className="italic">Bisher wurden keine SILC verteilt.</p>
        )}
      </div>
    </section>
  );
};
