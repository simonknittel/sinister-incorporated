import { type Metadata } from "next";
import { authenticatePage } from "../../../../lib/auth/server";
import { prisma } from "../../../../server/db";
import AddManufacturer from "./_components/AddManufacturer";
import AddSeries from "./_components/AddSeries";
import SeriesSection from "./_components/SeriesSection";

export const metadata: Metadata = {
  title: "Einstellungen - Flotte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/fleet/settings");
  authentication.authorizePage("manufacturersSeriesAndVariants", "manage");

  const data = await prisma.manufacturer.findMany({
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

      {data
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((data) => {
          return data.series
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((series) => (
              <SeriesSection
                key={series.id}
                manufacturer={data}
                data={series}
              />
            ));
        })}

      <div className="mt-4 flex items-center justify-center max-w-4xl gap-4">
        <AddManufacturer />
        <AddSeries manufacturers={data} />
      </div>
    </main>
  );
}
