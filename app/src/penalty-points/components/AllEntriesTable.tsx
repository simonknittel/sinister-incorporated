import { requireAuthentication } from "@/auth/server";
import clsx from "clsx";
import { getEntriesGroupedByCitizen } from "../queries";
import { AllEntriesTableClient } from "./AllEntriesTableClient";
import { CreatePenaltyEntry } from "./CreatePenaltyEntry";

type Props = Readonly<{
  className?: string;
}>;

export const AllEntriesTable = async ({ className }: Props) => {
  const authentication = await requireAuthentication();
  const showCreate = await authentication.authorize("penaltyEntry", "create");
  const showDelete = await authentication.authorize("penaltyEntry", "delete");

  const entries = await getEntriesGroupedByCitizen();
  const hasEntries = entries.size > 0;

  return (
    <section
      className={clsx("rounded-2xl bg-neutral-800/50 p-4 lg:p-8", className)}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-bold">Aktive Strafpunkte</h2>
        {showCreate && <CreatePenaltyEntry />}
      </div>

      {hasEntries ? (
        <AllEntriesTableClient
          rows={Array.from(entries.values())}
          showDelete={showDelete}
          className="mt-4"
        />
      ) : (
        <p className="mt-4 italic">Keine aktiven Strafpunkte vorhanden.</p>
      )}
    </section>
  );
};
