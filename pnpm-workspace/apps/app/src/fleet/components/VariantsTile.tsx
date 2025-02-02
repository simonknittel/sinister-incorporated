import { Actions } from "@/common/components/Actions";
import { VariantStatus, type Manufacturer, type Series } from "@prisma/client";
import clsx from "clsx";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegCircleXmark } from "react-icons/fa6";
import { getVariantsBySeriesId } from "../queries";
import { CreateVariantButton } from "./CreateVariantButton";
import { DeleteVariantButton } from "./DeleteVariantButton";
import { UpdateVariantButton } from "./UpdateVariantButton";
import { VariantTagBadge } from "./VariantTagBadge";

type Props = Readonly<{
  className?: string;
  manufacturerId: Manufacturer["id"];
  seriesId: Series["id"];
}>;

const GRID_COLS = "grid-cols-[256px_1fr_56px_44px]";

export const VariantsTile = async ({
  className,
  manufacturerId,
  seriesId,
}: Props) => {
  const variants = await getVariantsBySeriesId(seriesId);

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
          <tr
            className={clsx(
              "grid items-center gap-4 text-left text-neutral-500",
              GRID_COLS,
            )}
          >
            <th>Name</th>

            <th>Tags</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {variants.map((row) => {
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
                  {row.name}
                </td>

                <td className="overflow-hidden flex gap-1">
                  {row.tags
                    .toSorted((a, b) => a.key.localeCompare(b.key))
                    .map((tag) => (
                      <VariantTagBadge key={tag.id} tag={tag} />
                    ))}
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
                    <FaRegCheckCircle title="Flight ready" />
                  ) : row.status === VariantStatus.NOT_FLIGHT_READY ? (
                    <FaRegCircleXmark
                      title="Nicht flight ready"
                      className="text-sinister-red-500"
                    />
                  ) : null}
                </td>

                <td>
                  <Actions>
                    <UpdateVariantButton variant={row} />
                    <DeleteVariantButton
                      variant={row}
                      shipCount={row._count.ships}
                    />
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
