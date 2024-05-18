import {
  VariantStatus,
  type Manufacturer,
  type Series,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import { unstable_cache } from "next/cache";
import { prisma } from "../../../../../server/db";
import { Actions } from "../../../../_components/Actions";
import { CreateVariantButton } from "./CreateVariantButton";
import { DeleteVariantButton } from "./DeleteVariantButton";
import { UpdateVariantButton } from "./UpdateVariantButton";

const getVariantsBySeriesId = async (seriesId: Series["id"]) => {
  return prisma.variant.findMany({
    where: {
      seriesId,
    },
    orderBy: {
      name: "asc",
    },
  });
};

const getCachedVariantsBySeriesId = (seriesId: Variant["id"]) =>
  unstable_cache(
    async (variantId: Variant["id"]) => getVariantsBySeriesId(variantId),
    [],
    {
      tags: [`series:${seriesId}`],
    },
  )(seriesId);

type Props = Readonly<{
  className?: string;
  manufacturerId: Manufacturer["id"];
  seriesId: Series["id"];
}>;

export const VariantsTile = async ({
  className,
  manufacturerId,
  seriesId,
}: Props) => {
  const variants = await getCachedVariantsBySeriesId(seriesId);

  return (
    <section
      className={clsx(
        className,
        "p-8 pb-4 bg-neutral-800/50 rounded-2xl overflow-auto",
      )}
    >
      <div className="flex gap-4 mb-4 items-center">
        <h2 className="font-bold">Varianten</h2>

        <CreateVariantButton
          manufacturerId={manufacturerId}
          seriesId={seriesId}
        />
      </div>

      <table className="w-full min-w-[320px]">
        <thead>
          <tr className="grid items-center gap-4 text-left text-neutral-500 grid-cols-[1fr_1fr_44px]">
            <th>Name</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {variants.map((row) => {
            return (
              <tr
                key={row.id}
                className="grid items-center gap-4 px-2 h-14 rounded -mx-2 first:mt-2 grid-cols-[1fr_1fr_44px]"
              >
                <td
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title={row.name}
                >
                  {row.name}
                </td>

                <td
                  className="overflow-hidden text-ellipsis whitespace-nowrap"
                  title={
                    row.status === VariantStatus.FLIGHT_READY
                      ? "Flight ready"
                      : row.status === VariantStatus.NOT_FLIGHT_READY
                        ? "Nicht flight ready"
                        : undefined
                  }
                >
                  {row.status === VariantStatus.FLIGHT_READY ? (
                    "Flight ready"
                  ) : row.status === VariantStatus.NOT_FLIGHT_READY ? (
                    <span className="text-sinister-red-500">
                      Nicht flight ready
                    </span>
                  ) : null}
                </td>

                <td>
                  <Actions>
                    <UpdateVariantButton variant={row} />
                    <DeleteVariantButton variant={row} />
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
