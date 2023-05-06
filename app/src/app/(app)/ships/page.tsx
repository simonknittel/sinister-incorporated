import { type Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";
import AddManufacturer from "./_components/AddManufacturer";
import AddSeries from "./_components/AddSeries";
import SeriesSection from "./_components/SeriesSection";

export const metadata: Metadata = {
  title: "Schiffe | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (["admin"].includes(session!.user.role) === false) redirect("/fleet");

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
    <main>
      <h1 className="text-xl font-bold mb-8">Schiffe</h1>

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

      <div className="mt-8 flex items-center justify-center max-w-4xl gap-4">
        <AddManufacturer />
        <AddSeries manufacturers={data} />
      </div>
    </main>
  );
}
