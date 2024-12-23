import {
  type Manufacturer,
  type Series,
  type Ship,
  type Variant,
} from "@prisma/client";
import clsx from "clsx";
import { DeleteShip } from "./DeleteShip";
import { EditableShipName } from "./EditableShipName";

type Props = Readonly<{
  className?: string;
  ship: Ship & {
    variant: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
}>;

export const MyShipTile = ({ className, ship }: Props) => {
  return (
    <article
      className={clsx(
        className,
        "bg-neutral-800/50 rounded-2xl overflow-hidden",
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold p-4">
          <EditableShipName
            shipId={ship.id}
            name={ship.name || ship.variant.name}
          />
        </h3>

        <div className="pr-2">
          <DeleteShip ship={ship} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 px-4 pb-4">
        <div className="flex flex-col gap-2">
          <p>
            <span className="text-neutral-500">Variante:</span>{" "}
            {ship.variant.name}
          </p>

          <p>
            <span className="text-neutral-500">Hersteller:</span>{" "}
            {ship.variant.series.manufacturer.name}
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2"></div>
      </div>
    </article>
  );
};
