import { type Manufacturer, type Series, type Variant } from "@prisma/client";
import clsx from "clsx";
import AddSeries from "./AddSeries";
import AddVariant from "./AddVariant";
import VariantTag from "./VariantTag";

interface Props {
  className?: string;
  data: Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  };
}

const ManufacturerSection = ({ className, data }: Props) => {
  return (
    <section
      className={clsx(className, "p-8 bg-neutral-900 rounded max-w-4xl mt-8")}
    >
      <h2 className="font-bold text-xl">{data.name}</h2>

      {data.series
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((series) => (
          <div key={series.id} className="mt-2">
            <h3>{series.name}</h3>

            <ul className="mt-2 flex gap-2 items-center">
              {series.variants
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((variant) => (
                  <VariantTag key={variant.id} data={variant} />
                ))}

              <li>
                <AddVariant seriesId={series.id} />
              </li>
            </ul>
          </div>
        ))}

      <div className="mt-2 flex justify-center items-center">
        <AddSeries manufacturerId={data.id} />
      </div>
    </section>
  );
};

export default ManufacturerSection;
