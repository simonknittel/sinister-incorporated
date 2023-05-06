import {
  type FleetOwnership,
  type Manufacturer,
  type Series,
  type Variant,
} from "@prisma/client";
import DecrementOwnership from "../fleet/_components/DecrementOwnership";
import IncrementOwnership from "../fleet/_components/IncrementOwnership";

interface Props {
  ownership: FleetOwnership & {
    variant: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
  };
  nonInteractive?: boolean;
}

const ShipTile = ({ ownership, nonInteractive = false }: Props) => {
  return (
    <article className="bg-neutral-900 rounded overflow-hidden">
      <h3 className="flex gap-4 items-center font-bold">
        <span className="bg-neutral-950 py-2 px-4 rounded-br">
          {ownership.variant.series.manufacturer.name}
        </span>

        <span>{ownership.variant.name}</span>
      </h3>

      <div className="flex gap-2 items-center justify-center">
        {!nonInteractive && (
          <DecrementOwnership variantId={ownership.variantId} />
        )}

        <p className="p-4">{ownership.count}</p>

        {!nonInteractive && (
          <IncrementOwnership variantId={ownership.variantId} />
        )}
      </div>
    </article>
  );
};

export default ShipTile;
