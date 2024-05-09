import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FaChevronLeft } from "react-icons/fa";
import { prisma } from "../../../../../../../../server/db";
import { TileSkeleton } from "../../../../_components/TileSkeleton";
import { VariantsTile } from "../../../../_components/VariantsTile";

export const metadata: Metadata = {
  title: "Foobar - Schiffe | S.A.M. - Sinister Incorporated",
};

type Props = Readonly<{
  params: { manufacturerId: string; seriesId: string };
}>;

export default async function Page({ params }: Props) {
  const [series, manufacturer] = await Promise.all([
    prisma.series.findUnique({
      where: {
        id: params.seriesId,
      },
    }),

    prisma.manufacturer.findUnique({
      where: {
        id: params.manufacturerId,
      },
    }),
  ]);

  if (!series || !manufacturer) notFound();

  return (
    <main className="p-2 lg:p-8 pt-20">
      <Link
        href="/app/fleet/settings/manufacturer"
        className="text-neutral-500 hover:text-neutral-50 transition-colors inline-flex gap-2 items-center"
      >
        <FaChevronLeft /> Alle Hersteller
      </Link>

      <div className="flex gap-8 items-start mt-4 flex-col xl:flex-row">
        <div className="w-full xl:w-[400px]">
          <div className="bg-neutral-800/50 rounded-2xl">
            <Link
              href={`/app/fleet/settings/manufacturer/${manufacturer.id}`}
              className="font-bold flex gap-2 items-center group px-8 py-6"
            >
              <FaChevronLeft className="text-sinister-red-500 group-hover:text-sinister-red-300 transition-colors" />{" "}
              {manufacturer.name}
            </Link>
          </div>

          <section className="p-8 bg-neutral-800/50 rounded-2xl mt-4">
            <p className="font-bold mb-4">Serie</p>

            <dl>
              <dt className="text-neutral-500">Name</dt>
              <dd>
                <h1 className="font-bold">{series.name}</h1>
              </dd>
            </dl>
          </section>
        </div>

        <Suspense fallback={<TileSkeleton className="w-full flex-1" />}>
          <VariantsTile
            manufacturerId={params.manufacturerId}
            seriesId={params.seriesId}
            className="w-full flex-1"
          />
        </Suspense>
      </div>
    </main>
  );
}
