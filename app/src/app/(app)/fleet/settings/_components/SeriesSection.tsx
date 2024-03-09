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

const SeriesSection = ({ manufacturer, data }: Readonly<Props>) => {
  return (
    <div className="mt-2 bg-neutral-900/50 backdrop-blur rounded overflow-hidden max-w-4xl">
      <div className="flex justify-between items-center">
        <h2 className="flex gap-4 items-center font-bold">
          <span className="bg-neutral-950 py-2 px-4 rounded-br">
            {manufacturer.name}
          </span>

          <span>{data.name}</span>
        </h2>

        <DeleteSeriesButton series={data} />
      </div>

      <ul className="flex gap-2 items-center p-4 lg:p-8 flex-wrap">
        {data.variants
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((variant) => (
            <VariantTag key={variant.id} data={variant} />
          ))}

        <li>
          <AddVariant series={data} />
        </li>
      </ul>
    </div>
  );
};

export default SeriesSection;
