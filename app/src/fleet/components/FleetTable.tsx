"use client";

import { env } from "@/env";
import {
  VariantStatus,
  type Manufacturer,
  type Series,
  type Variant,
  type VariantTag,
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
import Image from "next/image";
import { useMemo, useState } from "react";
import { FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";

interface OrgShip {
  variant: Variant & {
    series: Series & {
      manufacturer: Manufacturer;
    };
    tags: VariantTag[];
  };
  count: number;
}

type Props = Readonly<{
  className?: string;
  ships: OrgShip[];
}>;

type Row = OrgShip;

const columnHelper = createColumnHelper<Row>();

const GRID_COLS = "grid-cols-[1fr_1fr_128px_56px]";

export const FleetTable = ({ className, ships }: Props) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "variant", desc: false },
  ]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("variant.name", {
        header: "Schiff",
        id: "variant",
        cell: (row) => {
          const manufacturer = row.row.original.variant.series.manufacturer;

          return (
            <div className="flex items-center gap-2">
              {manufacturer.imageId ? (
                <Image
                  src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${manufacturer.imageId}`}
                  alt={`Logo of ${manufacturer.name}`}
                  width={48}
                  height={48}
                  className="flex-none size-[48px] object-contain object-center"
                  title={`Logo of ${manufacturer.name}`}
                />
              ) : (
                <div className="flex-none size-[48px]"></div>
              )}

              <div
                className="whitespace-nowrap text-ellipsis overflow-hidden"
                title={row.getValue()}
              >
                {row.getValue()}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("variant.tags", {
        header: "Tags",
        cell: (row) => {
          return (
            <div className="overflow-hidden flex gap-1">
              {row.row.original.variant.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded bg-neutral-700/50 px-2 py-1 flex flex-col overflow-hidden"
                  title={`${tag.key}: ${tag.value}`}
                >
                  <span className="text-xs text-neutral-500 overflow-hidden text-ellipsis whitespace-nowrap">
                    {tag.key}
                  </span>
                  <span className="overflow-hidden whitespace-nowrap text-ellipsis">
                    {tag.value}
                  </span>
                </span>
              ))}
            </div>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor("variant.status", {
        header: "Status",
        cell: (row) => {
          if (row.getValue() === VariantStatus.FLIGHT_READY)
            return "Flight ready";
          if (row.getValue() === VariantStatus.NOT_FLIGHT_READY)
            return (
              <span className="text-sinister-red-500">Nicht flight ready</span>
            );
          return null;
        },
      }),
      columnHelper.accessor("count", {
        header: "Anzahl",
        cell: (row) => row.getValue(),
      }),
    ];
  }, []);

  const table = useReactTable({
    data: ships,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className={clsx("w-full min-w-[480px]", className)}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className={clsx("grid items-center gap-4", GRID_COLS)}
          >
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left text-neutral-500 p-0">
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
                      header.getContext(),
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
            className={clsx(
              "grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2",
              GRID_COLS,
            )}
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="overflow-hidden">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
