import { Actions } from "@/common/components/Actions";
import { type Manufacturer } from "@prisma/client";
import clsx from "clsx";
import Link from "next/link";
import { getSeriesByManufacturerIdCached } from "../utils/getSeriesByManufacturerId";
import { CreateSeriesButton } from "./CreateSeriesButton";
import { DeleteSeriesButton } from "./DeleteSeriesButton";

type Props = Readonly<{
  className?: string;
  manufacturerId: Manufacturer["id"];
}>;

const GRID_COLS = "grid-cols-[128px_1fr_44px]";

export const SeriesTile = async ({ className, manufacturerId }: Props) => {
  const series = await getSeriesByManufacturerIdCached(manufacturerId);

  return (
    <section
      className={clsx(
        className,
        "p-8 pb-4 bg-neutral-800/50 rounded-2xl overflow-auto",
      )}
    >
      <div className="flex gap-4 mb-4 items-center">
        <h2 className="font-bold">Serien</h2>

        <CreateSeriesButton manufacturerId={manufacturerId} />
      </div>

      <table className="w-full min-w-[320px]">
        <thead>
          <tr
            className={clsx(
              "grid items-center gap-4 text-left text-neutral-500",
              GRID_COLS,
            )}
          >
            <th>Name</th>

            <th>Varianten</th>
          </tr>
        </thead>

        <tbody>
          {series.map((row) => {
            return (
              <tr
                key={row.id}
                className={clsx(
                  "grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2",
                  GRID_COLS,
                )}
              >
                <td
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title={row.name}
                >
                  <Link
                    href={`/app/fleet/settings/manufacturer/${manufacturerId}/series/${row.id}`}
                    className="text-sinister-red-500 hover:text-sinister-red-300"
                  >
                    {row.name}
                  </Link>
                </td>

                <td className="line-clamp-2">
                  {row.variants.map((variant) => variant.name).join(", ")}
                </td>

                <td>
                  <Actions>
                    <DeleteSeriesButton series={row} />
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
