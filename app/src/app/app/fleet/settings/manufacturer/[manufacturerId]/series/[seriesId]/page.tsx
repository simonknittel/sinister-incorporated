import { EditableSeriesName } from "@/fleet/components/EditableSeriesName";
import { TileSkeleton } from "@/fleet/components/TileSkeleton";
import { VariantsTile } from "@/fleet/components/VariantsTile";
import { dedupedGetSeriesAndManufacturerById } from "@/fleet/utils/getSeriesAndManufacturer";
import { log } from "@/logging";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serializeError } from "serialize-error";

type Params = Promise<
  Readonly<{
    manufacturerId: string;
    seriesId: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const params = await props.params;
    const [series] = await dedupedGetSeriesAndManufacturerById(
      params.seriesId,
      params.manufacturerId,
    );

    if (!series) return {};

    return {
      title: `${series.name} - Schiffe | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
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

export default async function Page(props: Props) {
  const params = await props.params;
  const [series, manufacturer] = await dedupedGetSeriesAndManufacturerById(
    params.seriesId,
    params.manufacturerId,
  );

  if (!series || !manufacturer) notFound();

  return (
    <main className="flex gap-8 items-start flex-col xl:flex-row">
      <section className="p-8 bg-neutral-800/50 rounded-2xl w-full xl:w-[400px]">
        <p className="font-bold mb-4">Serie</p>

        <dl>
          <dt className="text-neutral-500">Name</dt>
          <dd>
            <EditableSeriesName series={series} />
          </dd>
        </dl>
      </section>

      <Suspense fallback={<TileSkeleton className="w-full flex-1" />}>
        <VariantsTile
          manufacturerId={series.id}
          seriesId={manufacturer.id}
          className="w-full flex-1"
        />
      </Suspense>
    </main>
  );
}
