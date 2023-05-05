"use client";

import { type User } from "@prisma/client";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
} from "@tanstack/react-table";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaSortAlphaDown,
  FaSortAlphaUpAlt,
  FaSpinner,
  FaTrashAlt,
} from "react-icons/fa";
import Avatar from "~/app/_components/Avatar";
import Button from "~/app/_components/Button";
import { type UserRole } from "~/types";

interface Props {
  users: User[];
}

type Row = User;

const columnHelper = createColumnHelper<Row>();

const UsersTable = ({ users }: Props) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoadingRemove, setIsLoadingRemove] = useState<User["id"] | null>(
    null
  );
  const [isLoadingChange, setIsLoadingChange] = useState<User["id"] | null>(
    null
  );
  const [sorting, setSorting] = useState<SortingState>([
    { id: "name", desc: false },
  ]);

  const handleRemove = async (user: User) => {
    setIsLoadingRemove(user.id);

    try {
      const confirmation = window.confirm(
        `You are about to remove "${user.name}". Do you want to continue?`
      );

      if (!confirmation) {
        setIsLoadingRemove(null);
        return;
      }

      const response = await fetch(`/api/user/${user.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.refresh();
        toast.success("Successfully removed user");
      } else {
        toast.error("There has been an error while removing the user.");
      }
    } catch (error) {
      toast.error("There has been an error while removing the user.");
      console.error(error);
    }

    setIsLoadingRemove(null);
  };

  const handleChange = async (user: User, newRole: UserRole) => {
    setIsLoadingChange(user.id);

    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        router.refresh();
        toast.success("Successfully updated user");
      } else {
        toast.error("There has been an error while updating the user.");
      }
    } catch (error) {
      toast.error("There has been an error while updating the user.");
      console.error(error);
    }

    setIsLoadingChange(null);
  };

  const columns = useMemo(() => {
    return [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (props) => {
          return (
            <div className="flex gap-2 items-center">
              <Avatar
                name={props.getValue()}
                image={props.row.original.image}
                size={32}
              />
              {props.getValue()}
            </div>
          );
        },
      }),
      columnHelper.accessor("role", {
        header: "Rolle",
        cell: (props) => {
          if (props.row.original.role === "admin") return "Admin";

          return (
            <div>
              <select
                defaultValue={props.getValue()}
                className="p-2 rounded bg-neutral-800 w-full"
                onChange={(e) =>
                  void handleChange(props.row.original, e.target.value)
                }
              >
                <option value="new">Neu</option>
                <option value="member">Mitglied</option>
                <option value="leadership">Leitung</option>
              </select>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        cell: (props) => {
          if (
            props.row.original.id === session?.user.id ||
            props.row.original.role === "admin"
          )
            return null;

          return (
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => void handleRemove(props.row.original)}
                variant="secondary"
                title={`"${props.row.original.name}" entfernen`}
                aria-label={`"${props.row.original.name}" entfernen`}
                iconOnly={true}
                disabled={Boolean(isLoadingRemove)}
              >
                {isLoadingRemove === props.row.original.id ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaTrashAlt />
                )}
              </Button>
            </div>
          );
        },
      }),
    ];
  }, [users.length, isLoadingRemove]);

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <table className="w-full">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr
            key={headerGroup.id}
            className="grid grid-cols-[1fr_1fr_8rem] items-center gap-4"
          >
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-left text-neutral-400">
                {header.isPlaceholder ? null : (
                  <div
                    {...{
                      className: header.column.getCanSort()
                        ? "cursor-pointer select-none flex items-center gap-2 hover:text-neutral-50"
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
            className="grid grid-cols-[1fr_1fr_8rem] items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="overflow-hidden text-ellipsis">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UsersTable;
