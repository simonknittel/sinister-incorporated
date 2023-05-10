import { type Manufacturer, type Series, type Variant } from "@prisma/client";

interface Props {
  variant: Variant & {
    series: Series & {
      manufacturer: Manufacturer;
    };
  };
  count: number;
}

const OrgShipTile = ({ variant, count }: Props) => {
  return (
    <article className="bg-neutral-900 rounded overflow-hidden">
      <h3 className="flex gap-4 items-center font-bold">
        <span className="bg-neutral-950 py-2 px-4 rounded-br">
          {variant.series.manufacturer.name}
        </span>

        <span>{variant.name}</span>
      </h3>

      <div className="flex flex-col gap-2">
        <p className="p-4">
          <span className="text-neutral-500">Anzahl:</span> {count}
        </p>
      </div>
    </article>
  );
};

export default OrgShipTile;
