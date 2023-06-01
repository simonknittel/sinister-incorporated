"use client";

import {
  type Entity,
  type EntityLog,
  type EntityLogAttribute,
  type Role,
  type User,
} from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  FaExternalLinkAlt,
  FaSortAlphaDown,
  FaSortAlphaUpAlt,
} from "react-icons/fa";
import Actions from "~/app/_components/Actions";
import useAuthentication from "~/app/_lib/auth/useAuthentication";
import DiscordIds from "../../entity/[id]/_components/discord-id/DiscordIds";
import Handles from "../../entity/[id]/_components/handle/Handles";
import AddRoles from "../../entity/[id]/_components/roles/AddRoles";
import SingleRole from "../../entity/[id]/_components/roles/SingleRole";
import TeamspeakIds from "../../entity/[id]/_components/teamspeak-id/TeamspeakIds";
import DeleteEntity from "./DeleteEntity";

type Row = {
  handle?: string | null;
  spectrumId: string;
  discordId?: string | null;
  teamspeakId?: string | null;
  createdAt: Date;
  lastSeenAt?: Date | null;
  entity: Entity & {
    logs: (EntityLog & {
      attributes: (EntityLogAttribute & { createdBy: User })[];
      submittedBy: User;
    })[];
  };
  roles: Role[];
};

const columnHelper = createColumnHelper<Row>();

interface Props {
  rows: Row[];
  assignableRoles: Role[];
}

const Table = ({ rows, assignableRoles }: Props) => {
  const authentication = useAuthentication();

  const showUpdateRolesButton = useMemo(() => {
    return (
      authentication &&
      (authentication.authorize([
        {
          resource: "otherRole",
          operation: "assign",
        },
      ]) ||
        authentication.authorize([
          {
            resource: "otherRole",
            operation: "dismiss",
          },
        ]))
    );
  }, [authentication]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("handle", {
        header: "Handle",
        cell: (row) => {
          return (
            <div className="flex gap-4 items-center">
              {row.getValue() || (
                <span className="text-neutral-500 italic">Unbekannt</span>
              )}
              <Handles entity={row.row.original.entity} />
            </div>
          );
        },
      }),
      columnHelper.accessor("spectrumId", {
        header: "Spectrum ID",
        cell: (row) => row.getValue(),
      }),
      columnHelper.accessor("discordId", {
        header: "Discord ID",
        cell: (row) => {
          return (
            <div className="flex gap-4 items-center">
              {row.getValue() || (
                <span className="text-neutral-500 italic">Unbekannt</span>
              )}
              <DiscordIds entity={row.row.original.entity} />
            </div>
          );
        },
      }),
      columnHelper.accessor("teamspeakId", {
        header: "TeamSpeak ID",
        cell: (row) => {
          return (
            <div className="flex gap-4 items-center">
              {row.getValue() || (
                <span className="text-neutral-500 italic">Unbekannt</span>
              )}
              <TeamspeakIds entity={row.row.original.entity} />
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "roles",
        header: "Rollen",
        cell: (row) => {
          return (
            <div className="flex gap-4 items-center">
              {row.row.original.roles.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {row.row.original.roles.map((role) => (
                    <SingleRole key={role.id} role={role} />
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 italic">Keine Rollen</p>
              )}

              {showUpdateRolesButton && (
                <AddRoles
                  entity={row.row.original.entity}
                  allRoles={assignableRoles}
                  assignedRoleIds={row.row.original.roles.map(
                    (role) => role.id
                  )}
                />
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("createdAt", {
        header: "Erstellt am",
        cell: (row) =>
          row.getValue().toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      }),
      columnHelper.accessor("lastSeenAt", {
        header: "Zuletzt gesehen",
        cell: (row) =>
          row.getValue()?.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
      }),
      columnHelper.display({
        id: "actions",
        cell: (props) => {
          return (
            <Actions>
              <Link
                href={`/spynet/entity/${props.row.original.entity.id}`}
                className="text-sinister-red-500 hover:text-sinister-red-300 flex gap-2 items-center text-sm whitespace-nowrap h-8"
              >
                <FaExternalLinkAlt />
                Vollständiger Eintrag
              </Link>

              {authentication &&
                authentication.authorize([
                  {
                    resource: "citizen",
                    operation: "delete",
                  },
                ]) && <DeleteEntity entity={props.row.original.entity} />}
            </Actions>
          );
        },
      }),
    ];
  }, [authentication, assignableRoles, showUpdateRolesButton]);

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="w-full min-w-[1600px]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_44px] items-center gap-4"
          >
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left text-neutral-500">
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: header.column.getCanSort()
                        ? "cursor-pointer select-none flex items-center gap-2 hover:text-neutral-300"
                        : "",
                      onClick: header.column.getToggleSortingHandler(),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{
                      asc: <FaSortAlphaDown />,
                      desc: <FaSortAlphaUpAlt />,
                    }[header.column.getIsSorted() as string] ?? null}
                  </div>
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_44px] items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={clsx({
                  "overflow-hidden text-ellipsis": cell.column.id !== "actions",
                })}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
