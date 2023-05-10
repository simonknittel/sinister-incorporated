import {
  type Manufacturer,
  type Series,
  type Ship,
  type Variant,
} from "@prisma/client";
import DeleteShip from "./DeleteShip";

interface Props {
  ship: Ship & {
    variant: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
}

const MyShipTile = ({ ship }: Props) => {
  return (
    <article className="bg-neutral-900 rounded overflow-hidden">
      <h3 className="font-bold">{ship.name || ship.variant.name}</h3>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
        <div className="flex flex-col gap-2">
          <p>
            <span className="text-neutral-500">Model:</span> {ship.variant.name}
          </p>

          <p>
            <span className="text-neutral-500">Hersteller:</span>{" "}
            {ship.variant.series.manufacturer.name}
          </p>
        </div>

        <div className="flex flex-col justify-end gap-2">
          <DeleteShip ship={ship} />
        </div>
      </div>
    </article>
  );
};

export default MyShipTile;
