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
      <h3 className="flex gap-4 items-center font-bold">
        <span className="bg-neutral-950 py-2 px-4 rounded-br">
          {ship.variant.name}
        </span>

        <span>{ship.name || ship.variant.name}</span>
      </h3>

      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 p-4">
        <div className="flex flex-col gap-2">
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
