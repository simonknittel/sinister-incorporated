import {
  getApplicationContext,
  getRequestActor,
  throwApplicationErrorForPage,
} from "@/modules/application";
import {
  CitizenTableSort,
  loadCitizenTableSearchParams,
} from "@/modules/citizen/utils/citizenTableSearchParams";
import { getFilterValues } from "@/modules/common/utils/filterCheckboxListParsers";
import { PER_PAGE } from "@/modules/common/utils/pagination";
import {
  CitizenListSort,
  CitizenUnknownAttribute,
  listCitizens,
  listCitizensInputSchema,
} from "@sam-monorepo/application";
import clsx from "clsx";
import type { SearchParams } from "nuqs/server";
import { CitizenTable } from "./CitizenTable";
import { CitizenTableFilters } from "./CitizenTableFilters";
import { CitizenTablePagination } from "./CitizenTableLinks";

const toCitizenListSort = (sort: CitizenTableSort) => {
  switch (sort) {
    case CitizenTableSort.HandleAscending:
      return CitizenListSort.HandleAscending;
    case CitizenTableSort.HandleDescending:
      return CitizenListSort.HandleDescending;
    case CitizenTableSort.CreatedAtAscending:
      return CitizenListSort.CreatedAscending;
    case CitizenTableSort.CreatedAtDescending:
      return CitizenListSort.CreatedDescending;
    case CitizenTableSort.LastSeenAtAscending:
      return CitizenListSort.LastSeenAscending;
    case CitizenTableSort.LastSeenAtDescending:
      return CitizenListSort.LastSeenDescending;
    default:
      throw new Error(`Unknown sort: ${sort satisfies never}`);
  }
};

/** The items of the "Unbekannt" filter. Other values select nothing. */
const UNKNOWN_FILTER_ATTRIBUTES = new Map([
  ["handle", CitizenUnknownAttribute.Handle],
  ["discord-id", CitizenUnknownAttribute.DiscordId],
  ["teamspeak-id", CitizenUnknownAttribute.TeamspeakId],
]);

interface Props {
  readonly className?: string;
  readonly searchParams: Promise<SearchParams>;
}

export const CitizenTableTile = async ({ className, searchParams }: Props) => {
  const actor = await getRequestActor();

  const { filters, sort, page } =
    await loadCitizenTableSearchParams(searchParams);

  const showLastSeenAtColumn = actor.authorize("lastSeen", "read");
  const showTeamspeakIdColumn = actor.authorize("teamspeak-id", "read");
  const showDiscordIdColumn = actor.authorize("discord-id", "read");
  const showDeleteEntityButton = actor.authorize("citizen", "delete");

  const result = await listCitizens(
    getApplicationContext(),
    actor,
    listCitizensInputSchema.parse({
      role_ids: getFilterValues(filters, "role"),
      unknown: getFilterValues(filters, "unknown").flatMap(
        (value) => UNKNOWN_FILTER_ATTRIBUTES.get(value) ?? [],
      ),
      sort: toCitizenListSort(sort),
      page,
      limit: PER_PAGE,
    }),
  ).catch(throwApplicationErrorForPage);

  const rows = result.citizens.map((citizen) => ({
    entity: {
      id: citizen.id,
      handle: citizen.handle,
      spectrumId: citizen.spectrum_id,
      discordId: citizen.discord_id,
      teamspeakId: citizen.teamspeak_id,
      createdAt: new Date(citizen.created_at),
    },
    lastSeenAt: citizen.last_seen_at ? new Date(citizen.last_seen_at) : null,
  }));

  return (
    <section
      className={clsx(
        "overflow-auto rounded-primary bg-neutral-800/50 p-6",
        className,
      )}
    >
      <CitizenTableFilters className="mb-6" />

      <CitizenTable
        rows={rows}
        showDiscordIdColumn={showDiscordIdColumn}
        showTeamspeakIdColumn={showTeamspeakIdColumn}
        showLastSeenAtColumn={showLastSeenAtColumn}
        showDeleteEntityButton={showDeleteEntityButton}
      />

      <div className="mt-6 flex justify-center">
        <CitizenTablePagination totalPages={result.page_count} />
      </div>
    </section>
  );
};
