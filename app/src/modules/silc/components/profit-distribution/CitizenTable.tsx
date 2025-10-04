"use client";

import { CitizenLink } from "@/modules/common/components/CitizenLink";
import YesNoCheckbox from "@/modules/common/components/form/YesNoCheckbox";
import type { Entity } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import clsx from "clsx";
import { useMemo, useState } from "react";
import { FaSortAlphaDown, FaSortAlphaUp } from "react-icons/fa";
import type { getProfitDistributionCycleById } from "../../queries";
import { CyclePhase } from "../../utils/getCurrentPhase";
import { getPayoutState, PayoutState } from "../../utils/getMyPayoutStatus";
import { CitizenTableForm } from "./CitizenTableForm";

interface Row {
  readonly id: string;
  readonly citizen: Pick<Entity, "id" | "handle">;
  readonly handle: string;
  readonly silc: number;
  readonly auec: number | null;
  readonly payoutState: PayoutState;
  readonly cededAt: Date | null;
  readonly acceptedAt: Date | null;
  readonly disbursedAt: Date | null;
}

const columnHelper = createColumnHelper<Row>();

const TABLE_MIN_WIDTH = "min-w-[320px]";
const GRID_COLS = "grid-cols-[256px_56px_128px_256px_128px_128px_128px]";

interface Props {
  readonly className?: string;
  readonly cycleData: NonNullable<
    Awaited<ReturnType<typeof getProfitDistributionCycleById>>
  >;
}

export const CitizenTable = ({ className, cycleData }: Props) => {
  const rows: Row[] = useMemo(() => {
    if (cycleData.currentPhase === CyclePhase.Collection) {
      return cycleData.allSilcBalances.map((citizen) => {
        const silc = citizen.silcBalance;

        const participant = cycleData.cycle.participants.find(
          (participant) => participant.citizenId === citizen.id,
        );
        let cededAt = null;
        let acceptedAt = null;
        let disbursedAt = null;
        if (participant) {
          cededAt = participant.cededAt;
          acceptedAt = participant.acceptedAt;
          disbursedAt = participant.disbursedAt;
        }

        return {
          id: citizen.id,
          citizen,
          handle: citizen.handle!,
          silc,
          auec: null,
          payoutState: PayoutState.PAYOUT_NOT_YET_STARTED,
          cededAt,
          acceptedAt,
          disbursedAt,
        };
      });
    }

    return cycleData.cycle.participants.map((participant) => {
      const silc =
        (cycleData.currentPhase === CyclePhase.Collection
          ? participant.citizen.silcBalance
          : participant.silcBalanceSnapshot) || 0;

      const auec =
        silc && cycleData.auecPerSilc ? silc * cycleData.auecPerSilc : null;

      const payoutState = getPayoutState(cycleData.cycle, participant);

      return {
        id: participant.citizen.id,
        citizen: participant.citizen,
        handle: participant.citizen.handle!,
        silc,
        auec,
        payoutState,
        cededAt: participant.cededAt,
        acceptedAt: participant.acceptedAt,
        disbursedAt: participant.disbursedAt,
      };
    });
  }, [
    cycleData.currentPhase,
    cycleData.auecPerSilc,
    cycleData.cycle,
    cycleData.allSilcBalances,
  ]);

  const [sorting, setSorting] = useState<SortingState>([
    { id: "handle", desc: false },
  ]);

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("handle", {
        header: "Member",
        id: "handle",
        cell: (row) => {
          return <CitizenLink citizen={row.row.original.citizen} />;
        },
        sortingFn: "alphanumeric",
      }),
      columnHelper.accessor("silc", {
        header: "SILC",
        cell: (row) => {
          return row.getValue().toLocaleString("de");
        },
      }),
      columnHelper.accessor("auec", {
        header: "aUEC",
        cell: (row) => {
          if (!row.getValue()) return "-";
          return row.getValue()!.toLocaleString("de");
        },
      }),
      columnHelper.accessor("payoutState", {
        header: "Status",
        cell: (row) => {
          switch (row.getValue()) {
            case PayoutState.NOT_PARTICIPATING:
              return <span>-</span>;

            case PayoutState.CEDED:
              return <span>Abgetreten</span>;

            case PayoutState.PAYOUT_NOT_YET_STARTED:
              return <span>Auszahlung noch nicht gestartet</span>;

            case PayoutState.AWAITING_ACCEPTANCE:
              return (
                <span className="text-red-500">Zustimmung ausstehend</span>
              );

            case PayoutState.AWAITING_PAYOUT:
              return (
                <span className="text-blue-500">Auszahlung ausstehend</span>
              );

            case PayoutState.DISBURSED:
              return <span className="text-green-500">Ausgezahlt</span>;

            case PayoutState.EXPIRED:
              return <span className="text-red-500">Verfallen</span>;

            case PayoutState.PAYOUT_OVERDUE:
              return <span className="text-red-500">Überfällig</span>;

            case PayoutState.UNKNOWN:
            default:
              return <span className="text-red-500">Unbekannt</span>;
          }
        },
      }),
      columnHelper.accessor("cededAt", {
        header: "Abgetreten",
        cell: (row) => {
          return (
            <YesNoCheckbox
              name={`ceded_${cycleData.cycle.id}_${row.row.original.citizen.id}`}
              defaultChecked={!!row.getValue()}
              disabled={cycleData.currentPhase !== CyclePhase.Collection}
              yesLabel=""
              noLabel=""
            />
          );
        },
      }),
      columnHelper.accessor("acceptedAt", {
        header: "Zugestimmt",
        cell: (row) => {
          return (
            <YesNoCheckbox
              name={`accepted_${cycleData.cycle.id}_${row.row.original.citizen.id}`}
              defaultChecked={!!row.getValue()}
              disabled={cycleData.currentPhase !== CyclePhase.Payout}
              yesLabel=""
              noLabel=""
            />
          );
        },
      }),
      columnHelper.accessor("disbursedAt", {
        header: "Ausgezahlt",
        cell: (row) => {
          return (
            <YesNoCheckbox
              name={`disbursed_${cycleData.cycle.id}_${row.row.original.citizen.id}`}
              defaultChecked={!!row.getValue()}
              disabled={cycleData.currentPhase !== CyclePhase.Payout}
              yesLabel=""
              noLabel=""
            />
          );
        },
      }),
    ];
  }, [cycleData.currentPhase, cycleData.cycle.id]);

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
    <CitizenTableForm className="overflow-x-auto">
      <table className={clsx("w-full", TABLE_MIN_WIDTH, className)}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr
              key={headerGroup.id}
              className={clsx("grid items-center gap-4 pb-2", GRID_COLS)}
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
                        desc: <FaSortAlphaUp />,
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
              className={clsx("grid items-center gap-4", GRID_COLS)}
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
    </CitizenTableForm>
  );
};
