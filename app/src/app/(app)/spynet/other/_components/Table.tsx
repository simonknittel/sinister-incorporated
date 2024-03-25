import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type User,
} from "@prisma/client";
import Link from "next/link";
import { FaExternalLinkAlt, FaSortDown, FaSortUp } from "react-icons/fa";
import { entityLogTypeTranslations } from "../../../../../_lib/entityLogTypeTranslations";
import { type EntityLogConfirmationState } from "../../../../../types";
import Actions from "../../../../_components/Actions";
import ConfirmationState from "./ConfirmationState";
import DeleteLog from "./DeleteLog";

export type Row = {
  entity: Entity;
  confirmationState?: EntityLogConfirmationState;
  confirmedAt?: Date;
  confirmedBy?: User;
  entityLog: EntityLog & {
    attributes: EntityLogAttribute[];
    submittedBy: User;
  };
};

interface Props {
  rows: Row[];
  searchParams: URLSearchParams;
}

const Table = ({ rows, searchParams }: Readonly<Props>) => {
  const createdAtSearchParams = new URLSearchParams(searchParams);
  if (
    !searchParams.has("sort") ||
    searchParams.get("sort") === "created-at-desc"
  ) {
    createdAtSearchParams.set("sort", "created-at-asc");
  } else {
    createdAtSearchParams.set("sort", "created-at-desc");
  }

  const confirmedAtSearchParams = new URLSearchParams(searchParams);
  if (searchParams.get("sort") === "confirmed-at-desc") {
    confirmedAtSearchParams.set("sort", "confirmed-at-asc");
  } else {
    confirmedAtSearchParams.set("sort", "confirmed-at-desc");
  }

  return (
    <table className="w-full min-w-[1600px]">
      <thead>
        <tr className="grid items-center gap-4 text-left text-neutral-500 grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_44px]">
          <th>Citizen</th>

          <th>Merkmal</th>

          <th>Wert</th>

          <th>Bestätigungsstatus</th>

          <th>
            <Link
              href={`?${confirmedAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
            >
              Bestätigt am
              {(!searchParams.has("sort") ||
                searchParams.get("sort") === "confirmed-at-desc") && (
                <FaSortDown />
              )}
              {searchParams.get("sort") === "confirmed-at-asc" && <FaSortUp />}
            </Link>
          </th>

          <th className="whitespace-nowrap">Bestätigt von</th>

          <th>
            <Link
              href={`?${createdAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300 whitespace-nowrap"
            >
              Eingereicht am
              {(!searchParams.has("sort") ||
                searchParams.get("sort") === "created-at-desc") && (
                <FaSortDown />
              )}
              {searchParams.get("sort") === "created-at-asc" && <FaSortUp />}
            </Link>
          </th>

          <th className="whitespace-nowrap">Eingereicht von</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          return (
            <tr
              key={row.entityLog.id}
              className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2 grid-cols-[1fr_1fr_2fr_1fr_1fr_1fr_1fr_1fr_44px]"
            >
              <td className="overflow-hidden">
                <Link
                  href={`/spynet/entity/${row.entity.id}`}
                  className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center justify-between"
                  prefetch={false}
                >
                  <span className="overflow-hidden text-ellipsis">
                    {row.entity.handle ? (
                      <span title={row.entity.handle}>{row.entity.handle}</span>
                    ) : (
                      <span
                        title="Unbekannt"
                        className="text-neutral-500 italic"
                      >
                        Unbekannt
                      </span>
                    )}
                  </span>
                  <FaExternalLinkAlt />
                </Link>
              </td>

              <td
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                title={entityLogTypeTranslations[row.entityLog.type]}
              >
                {entityLogTypeTranslations[row.entityLog.type]}
              </td>

              <td
                className="overflow-hidden text-ellipsis whitespace-nowrap"
                title={row.entityLog.content || undefined}
              >
                {row.entityLog.content}
              </td>

              <td>
                <ConfirmationState
                  confirmationState={row.confirmationState}
                  entityLog={row.entityLog}
                />
              </td>

              <td className="overflow-hidden text-ellipsis">
                {row.confirmedAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              <td
                className="overflow-hidden text-ellipsis"
                title={row.confirmedBy?.name || undefined}
              >
                {row.confirmedBy?.name}
              </td>

              <td className="overflow-hidden text-ellipsis">
                {row.entityLog.createdAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              <td
                className="overflow-hidden text-ellipsis"
                title={row.entityLog.submittedBy.name || undefined}
              >
                {row.entityLog.submittedBy.name}
              </td>

              <td>
                <Actions>
                  <DeleteLog log={row.entityLog} />
                </Actions>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Table;
