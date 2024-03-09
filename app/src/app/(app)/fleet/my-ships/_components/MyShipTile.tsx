import {
  type Manufacturer,
  type Series,
  type Ship,
  type Variant,
} from "@prisma/client";
import DeleteShip from "./DeleteShip";
import EditShip from "./EditShip";

interface Props {
  ship: Ship & {
    variant: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
}

const MyShipTile = ({ ship }: Readonly<Props>) => {
  return (
    <article className="bg-neutral-900/50 backdrop-blur rounded overflow-hidden">
      <div className="flex justify-between items-center">
        <h3 className="font-bold p-4">{ship.name || ship.variant.name}</h3>

        <div className="pr-2">
          <EditShip ship={ship} />
          <DeleteShip ship={ship} />
        </div>
      </div>

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

        <div className="flex flex-col justify-end gap-2"></div>
      </div>
    </article>
  );
};

export default MyShipTile;
