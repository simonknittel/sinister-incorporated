import { Actions } from "@/common/components/Actions";
import { env } from "@/env";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { getManufacturersCached } from "../utils/getManufacturers";
import { DeleteManufacturerButton } from "./DeleteManufacturerButton";

const GRID_COLS = "grid-cols-[48px_192px_1fr_44px]";

export const ManufacturersTile = async () => {
  const rows = await getManufacturersCached();

  return (
    <section className="p-8 pb-4 bg-neutral-800/50  mt-4 rounded-2xl overflow-auto">
      <table className="w-full min-w-[320px]">
        <thead>
          <tr
            className={clsx(
              "grid items-center gap-4 text-left text-neutral-500",
              GRID_COLS,
            )}
          >
            <th>Logo</th>

            <th>Name</th>

            <th>Serien</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            return (
              <tr
                key={row.id}
                className={clsx(
                  "grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2",
                  GRID_COLS,
                )}
              >
                <td>
                  {row.imageId && (
                    <Image
                      src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${row.imageId}`}
                      width={48}
                      height={48}
                      alt={`Logo of ${row.name}`}
                      className="w-[48px] h-[48px] object-contain object-center"
                    />
                  )}
                </td>

                <td
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title={row.name}
                >
                  <Link
                    href={`/app/fleet/settings/manufacturer/${row.id}`}
                    className="text-sinister-red-500 hover:underline"
                  >
                    {row.name}
                  </Link>
                </td>

                <td className="line-clamp-2">
                  {row.series.map((series, index) => (
                    <span key={series.id}>
                      {index > 0 && ", "}
                      <Link
                        key={series.id}
                        href={`/app/fleet/settings/manufacturer/${row.id}/series/${series.id}`}
                        className="text-sinister-red-500 hover:underline"
                      >
                        {series.name}
                      </Link>
                    </span>
                  ))}
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
