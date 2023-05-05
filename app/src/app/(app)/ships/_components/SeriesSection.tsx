import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import AddVariant from "./AddVariant";
import DeleteSeriesButton from "./DeleteSeriesButton";
import VariantTag from "./VariantTag";

interface Props {
  manufacturer: Manufacturer;
  data: Series & {
    variants: Variant[];
  };
}

const SeriesSection = ({ manufacturer, data }: Props) => {
  return (
    <div className="mt-2 bg-neutral-900 rounded overflow-hidden max-w-4xl">
      <div className="flex justify-between">
        <h2 className="flex gap-4 items-center font-bold">
          <span className="bg-sinister-red-500 py-2 px-4 rounded-br">
            {manufacturer.name}
          </span>

          <span>{data.name}</span>
        </h2>

        <DeleteSeriesButton series={data} />
      </div>

      <ul className="flex gap-2 items-center p-8">
        {data.variants
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((variant) => (
            <VariantTag key={variant.id} data={variant} />
          ))}

        <li>
          <AddVariant seriesId={data.id} />
        </li>
      </ul>
    </div>
  );
};

export default SeriesSection;
