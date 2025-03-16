import { Actions } from "@/common/components/Actions";
import { Link } from "@/common/components/Link";
import { Tile } from "@/common/components/Tile";
import { env } from "@/env";
import clsx from "clsx";
import Image from "next/image";
import { getManufacturers } from "../queries";
import { CreateManufacturereButton } from "./CreateManufacturerButton";
import { DeleteManufacturerButton } from "./DeleteManufacturerButton";

const GRID_COLS = "grid-cols-[48px_192px_1fr_44px]";

export const ManufacturersTile = async () => {
  const rows = await getManufacturers();

  return (
    <Tile
      heading="Hersteller"
      cta={<CreateManufacturereButton />}
      childrenClassName="overflow-auto"
    >
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
                  {row.image && (
                    <Image
                      src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${row.image.id}`}
                      width={48}
                      height={48}
                      alt={`Logo of ${row.name}`}
                      className="w-[48px] h-[48px] object-contain object-center"
                      unoptimized={["image/svg+xml", "image/gif"].includes(
                        row.image.mimeType,
                      )}
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
                    prefetch={false}
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
                        prefetch={false}
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
    </Tile>
  );
};
