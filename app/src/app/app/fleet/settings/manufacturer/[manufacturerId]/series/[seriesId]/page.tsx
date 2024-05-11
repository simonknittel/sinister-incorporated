import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serializeError } from "serialize-error";
import { log } from "../../../../../../../../lib/logging";
import { prisma } from "../../../../../../../../server/db";
import { TileSkeleton } from "../../../../_components/TileSkeleton";
import { VariantsTile } from "../../../../_components/VariantsTile";

type Params = Readonly<{
  manufacturerId: string;
  seriesId: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const series = await prisma.series.findUnique({
      where: {
        id: params.seriesId,
      },
    });

    if (!series) return {};

    return {
      title: `${series.name} - Schiffe | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    log.error(
      "Error while generating metadata for /(app)/spynet/entity/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
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
      <div className="flex gap-2">
        <Link
          href="/app/fleet/settings/manufacturer"
          className="text-sinister-red-500 hover:text-sinister-red-300 transition-colors"
        >
          Alle Hersteller
        </Link>

        <span className="text-neutral-700">/</span>

        <Link
          href={`/app/fleet/settings/manufacturer/${manufacturer.id}`}
          className="text-sinister-red-500 hover:text-sinister-red-300 transition-colors"
        >
          {manufacturer.name}
        </Link>

        <span className="text-neutral-700">/</span>

        <h1 className="font-bold">{series.name}</h1>
      </div>

      <div className="flex gap-8 items-start mt-4 flex-col xl:flex-row">
        <section className="p-8 bg-neutral-800/50 rounded-2xl w-full xl:w-[400px]">
          <p className="font-bold mb-4">Serie</p>

          <dl>
            <dt className="text-neutral-500">Name</dt>
            <dd>{series.name}</dd>
          </dl>
        </section>

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
