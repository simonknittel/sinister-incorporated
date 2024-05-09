"use client";

import {
  VariantStatus,
  type Manufacturer,
  type Series,
  type Variant,
} from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { FaSortAlphaDown, FaSortAlphaUpAlt } from "react-icons/fa";

interface OrgShip {
  variant: Variant & {
    series: Series & {
      manufacturer: Manufacturer;
    };
  };
  count: number;
}

interface Props {
  ships: OrgShip[];
}

type Row = OrgShip;

const columnHelper = createColumnHelper<Row>();

const FleetTable = ({ ships }: Readonly<Props>) => {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "variant_series.manufacturer.name", desc: false },
    { id: "variant_series.name", desc: false },
    { id: "variant_name", desc: false },
  ]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("variant.name", {
        header: "Variante",
        cell: (row) => row.getValue(),
      }),
      columnHelper.accessor("variant.series.name", {
        header: "Serie",
        cell: (row) => row.getValue(),
      }),
      columnHelper.accessor("variant.series.manufacturer.name", {
        header: "Hersteller",
        cell: (row) => row.getValue(),
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
    <table className="w-full min-w-[512px]">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="grid grid-cols-[2fr_2fr_2fr_2fr_1fr] items-center gap-4"
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
            className="grid grid-cols-[2fr_2fr_2fr_2fr_1fr] items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className="overflow-hidden text-ellipsis whitespace-nowrap"
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

export default FleetTable;
