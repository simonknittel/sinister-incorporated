import clsx from "clsx";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serializeError } from "serialize-error";
import { log } from "../../../../../../lib/logging";
import { ImageUpload } from "../../../../../_components/ImageUpload";
import { SeriesTile } from "../../_components/SeriesTile";
import { TileSkeleton } from "../../_components/TileSkeleton";
import { getManufacturer } from "../_lib/getManufacturer";
import { EditableName } from "./_components/EditableName";

type Params = Readonly<{
  manufacturerId: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const manufacturer = await getManufacturer(params.manufacturerId);

    if (!manufacturer) return {};

    return {
      title: `${manufacturer.name} - Schiffe | S.A.M. - Sinister Incorporated`,
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
  const manufacturer = await getManufacturer(params.manufacturerId);
  if (!manufacturer) notFound();

  return (
    <main className="flex gap-8 items-start flex-col xl:flex-row">
      <section className="rounded-2xl overflow-hidden w-full xl:w-[400px]">
        <ImageUpload
          resourceType="manufacturer"
          resource={manufacturer}
          width={400}
          height={128}
          className={clsx(
            "bg-black p-2 text-neutral-500 hover:text-neutral-300 transition-colors",
            {
              "h-32 after:content-['Logo_hochladen'] flex items-center justify-center":
                !manufacturer.imageId,
            },
          )}
          imageClassName="w-full h-32"
        />

        <div className="p-8 bg-neutral-800/50">
          <p className="font-bold mb-4">Hersteller</p>

          <dl className="mt-4">
            <dt className="text-neutral-500">Name</dt>
            <dd>
              <EditableName manufacturer={manufacturer} />
            </dd>
          </dl>
        </div>
      </section>

      <Suspense fallback={<TileSkeleton className="w-full flex-1" />}>
        <SeriesTile
          manufacturerId={params.manufacturerId}
          className="w-full flex-1"
        />
      </Suspense>
    </main>
  );
}
