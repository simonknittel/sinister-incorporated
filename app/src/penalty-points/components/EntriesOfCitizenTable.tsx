import { requireAuthentication } from "@/auth/server";
import { Tile } from "@/common/components/Tile";
import type { Entity } from "@prisma/client";
import clsx from "clsx";
import { getEntriesOfCitizen } from "../queries";
import { AllEntriesTableClient } from "./AllEntriesTableClient";
import { CreatePenaltyEntry } from "./CreatePenaltyEntry";

interface Props {
  readonly className?: string;
  readonly citizenId: Entity["id"];
}

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
    <Tile
      heading="Aktive Strafpunkte"
      cta={showCreate ? <CreatePenaltyEntry /> : null}
      className={clsx(className)}
    >
      {hasEntries ? (
        <AllEntriesTableClient
          rows={Array.from(entries.values())}
          showDelete={showDelete}
        />
      ) : (
        <p className="italic">Keine aktiven Strafpunkte vorhanden.</p>
      )}
    </Tile>
  );
};
