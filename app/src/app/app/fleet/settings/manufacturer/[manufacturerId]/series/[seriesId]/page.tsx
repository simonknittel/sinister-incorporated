import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serializeError } from "serialize-error";
import { log } from "../../../../../../../../lib/logging";
import { TileSkeleton } from "../../../../_components/TileSkeleton";
import { VariantsTile } from "../../../../_components/VariantsTile";
import { EditableSeriesName } from "../../../_components/EditableSeriesName";
import { getSeriesAndManufacturer } from "../../../_lib/getSeriesAndManufacturer";

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
    const [series] = await getSeriesAndManufacturer(
      params.seriesId,
      params.manufacturerId,
    );

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
  const [series, manufacturer] = await getSeriesAndManufacturer(
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
          manufacturerId={params.manufacturerId}
          seriesId={params.seriesId}
          className="w-full flex-1"
        />
      </Suspense>
    </main>
  );
}
