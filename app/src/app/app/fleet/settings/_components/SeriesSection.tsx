import { type Series, type Variant } from "@prisma/client";
import AddVariant from "./AddVariant";
import DeleteSeriesButton from "./DeleteSeriesButton";
import VariantTag from "./VariantTag";

type Props = Readonly<{
  series: Series & {
    variants: Variant[];
  };
}>;

export const SeriesSection = ({ series }: Props) => {
  return (
    <div className="px-4 lg:px-8">
      <div className="flex gap-2 items-center">
        <h3 className="font-bold">{series.name}</h3>
        <DeleteSeriesButton series={series} />
      </div>

      <ul className="flex gap-2 items-center flex-wrap mt-2">
        {series.variants
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((variant) => (
            <VariantTag key={variant.id} data={variant} />
          ))}

        <li className="pl-2">
          <AddVariant series={series} />
        </li>
      </ul>
    </div>
  );
};
