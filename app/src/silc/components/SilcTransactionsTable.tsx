import { requireAuthentication } from "@/auth/server";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { getSilcTransactionsOfCitizen } from "../queries";
import { SilcTransactionsTableClient } from "./SilcTransactionsTableClient";

type Props = Readonly<{
  className?: string;
  citizenId: Entity["id"];
}>;

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
    <section className={clsx("rounded-2xl bg-neutral-800/50", className)}>
      <h2 className="font-bold text-xl border-b border-white/5 p-4 lg:px-8">
        Transaktionen
      </h2>

      <div className="p-4 lg:p-8">
        {hasEntries ? (
          <SilcTransactionsTableClient
            rows={entries}
            showEdit={showEdit}
            showDelete={showDelete}
          />
        ) : (
          <p className="italic">Bisher wurden keine SILC verteilt.</p>
        )}
      </div>
    </section>
  );
};
