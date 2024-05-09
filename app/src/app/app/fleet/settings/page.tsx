import { type Metadata } from "next";
import { authenticatePage } from "../../../../lib/auth/server";
import { prisma } from "../../../../server/db";
import AddManufacturer from "./_components/AddManufacturer";
import { AddSeries } from "./_components/AddSeries";
import { SeriesSection } from "./_components/SeriesSection";

export const metadata: Metadata = {
  title: "Einstellungen - Flotte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/fleet/settings");
  authentication.authorizePage("manufacturersSeriesAndVariants", "manage");

  const manufacturers = await prisma.manufacturer.findMany({
    include: {
      series: {
        include: {
          variants: true,
        },
      },
    },
  });

  return (
    <main className="p-2 lg:p-8 pt-20">
      <h1 className="text-xl font-bold mb-4">Schiffe</h1>

      {manufacturers
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((manufacturer) => {
          return (
            <div
              key={manufacturer.id}
              className="mt-2 bg-neutral-800/50 rounded-2xl overflow-hidden max-w-4xl pb-4 lg:pb-8 flex flex-col gap-4 lg:gap-8 items-start"
            >
              <div className="flex justify-between">
                <h2 className="flex gap-4 items-center font-bold">
                  <span className="bg-neutral-800 py-2 px-4 rounded-br">
                    {manufacturer.name}
                  </span>
                </h2>
              </div>

              {manufacturer.series.length > 0 && (
                <div className="flex flex-col gap-4 lg:gap-8">
                  {manufacturer.series
                    .toSorted((a, b) => a.name.localeCompare(b.name))
                    .map((series) => (
                      <SeriesSection key={series.id} series={series} />
                    ))}
                </div>
              )}

              <AddSeries
                className="ml-4 lg:ml-8"
                manufacturerId={manufacturer.id}
              />
            </div>
          );
        })}

      <div className="mt-4 flex items-center justify-center max-w-4xl gap-4">
        <AddManufacturer />
      </div>
    </main>
  );
}
