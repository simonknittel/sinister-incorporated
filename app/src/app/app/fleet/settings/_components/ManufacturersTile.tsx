import Image from "next/image";
import Link from "next/link";
import { env } from "../../../../../env.mjs";
import { prisma } from "../../../../../server/db";
import Actions from "../../../../_components/Actions";
import { DeleteManufacturerButton } from "./DeleteManufacturerButton";

export const ManufacturersTile = async () => {
  const rows = await prisma.manufacturer.findMany({
    select: {
      id: true,
      imageId: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <section className="p-8 pb-4 bg-neutral-800/50  mt-4 rounded-2xl overflow-auto">
      <table className="w-full min-w-[320px]">
        <thead>
          <tr className="grid items-center gap-4 text-left text-neutral-500 grid-cols-[48px_1fr_44px]">
            <th>Logo</th>

            <th>Name</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            return (
              <tr
                key={row.id}
                className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2 grid-cols-[48px_1fr_44px]"
              >
                <td>
                  {row.imageId && (
                    <Image
                      src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${row.imageId}`}
                      width={48}
                      height={48}
                      alt={`Logo of ${row.name}`}
                      className="max-w-[48px] max-h-[48px] w-auto h-a"
                    />
                  )}
                </td>

                <td
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title={row.name}
                >
                  <Link
                    href={`/app/fleet/settings/manufacturer/${row.id}`}
                    className="text-sinister-red-500 hover:text-sinister-red-300"
                  >
                    {row.name}
                  </Link>
                </td>

                <td>
                  <Actions>
                    <DeleteManufacturerButton manufacturer={row} />
                  </Actions>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};
