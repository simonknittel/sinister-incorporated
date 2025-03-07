import { requireAuthentication } from "@/auth/server";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { getEntriesOfCitizen } from "../queries";
import { AllEntriesTableClient } from "./AllEntriesTableClient";
import { CreatePenaltyEntry } from "./CreatePenaltyEntry";

type Props = Readonly<{
  className?: string;
  citizenId: Entity["id"];
}>;

export const EntriesOfCitizenTable = async ({
  className,
  citizenId,
}: Props) => {
  const authentication = await requireAuthentication();
  const [showCreate, showDelete] = await Promise.all([
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("penaltyEntry", "delete"),
  ]);

  const entries = await getEntriesOfCitizen(citizenId);
  const hasEntries = entries.size > 0;

  return (
    <section className={clsx("rounded-2xl bg-neutral-800/50", className)}>
      <div className="flex justify-between items-center border-b border-white/5">
        <h2 className="font-bold text-xl p-4 lg:px-8">Aktive Strafpunkte</h2>

        {showCreate && (
          <div className="pr-4 lg:pr-8">
            <CreatePenaltyEntry />
          </div>
        )}
      </div>

      <div className="p-4 lg:p-8">
        {hasEntries ? (
          <AllEntriesTableClient
            rows={Array.from(entries.values())}
            showDelete={showDelete}
          />
        ) : (
          <p className="italic">Keine aktiven Strafpunkte vorhanden.</p>
        )}
      </div>
    </section>
  );
};
