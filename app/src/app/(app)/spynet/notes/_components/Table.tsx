import {
  type ClassificationLevel,
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type NoteType,
  type User,
} from "@prisma/client";
import Link from "next/link";
import { FaSortDown, FaSortUp } from "react-icons/fa";
import Actions from "~/app/_components/Actions";
import UpdateNote from "../../entity/[id]/_components/notes/UpdateNote";

export type Row = {
  entity: {
    handle: null | string;
    entity: Entity;
  };
  excerpt: string;
  noteType: NoteType;
  classificationLevel: ClassificationLevel;
  createdBy: User;
  confirmationState: null | "confirmed" | "falseReport";
  confirmedAt: null | Date;
  confirmedBy: null | User;
  entityLog: EntityLog & {
    attributes: EntityLogAttribute[];
  };
};

interface Props {
  rows: Row[];
  searchParams: URLSearchParams;
}

const Table = ({ rows, searchParams }: Props) => {
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
        <tr className="grid items-center gap-4 text-left text-neutral-500 grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_44px]">
          <th>Citizen</th>

          <th>Inhalt</th>

          <th>Notizart</th>

          <th>Geheimhaltungsstufe</th>

          <th>
            <Link
              href={`/spynet/citizen?${createdAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300"
            >
              Erstellt am
              {(!searchParams.has("sort") ||
                searchParams.get("sort") === "created-at-desc") && (
                <FaSortDown />
              )}
              {searchParams.get("sort") === "created-at-asc" && <FaSortUp />}
            </Link>
          </th>

          <th>Erstellt von</th>

          <th>Bestätigungsstatus</th>

          <th>
            <Link
              href={`/spynet/citizen?${createdAtSearchParams.toString()}`}
              prefetch={false}
              className="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-300"
            >
              Bestätigt am
              {(!searchParams.has("sort") ||
                searchParams.get("sort") === "created-at-desc") && (
                <FaSortDown />
              )}
              {searchParams.get("sort") === "created-at-asc" && <FaSortUp />}
            </Link>
          </th>

          <th>Bestätigt von</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row) => {
          return (
            <tr
              key={row.entityLog.id}
              className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
            >
              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                <Link href={`/spynet/entity/${row.entity.entity.id}`}>
                  {row.entity.handle || (
                    <span className="text-neutral-500 italic">Unbekannt</span>
                  )}
                </Link>
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.excerpt}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.noteType.name}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.classificationLevel.name}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.entityLog.createdAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.confirmationState}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.confirmedAt?.toLocaleDateString("de-DE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </td>

              <td className="overflow-hidden text-ellipsis whitespace-nowrap flex gap-4 items-center">
                {row.confirmedBy?.name}
              </td>

              <td>
                <Actions>
                  <UpdateNote note={row.entityLog} />
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
