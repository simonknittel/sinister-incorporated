import { ImageUpload } from "@/common/components/ImageUpload";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { EditableManufacturerName } from "@/fleet/components/EditableManufacturerName";
import { SeriesTile } from "@/fleet/components/SeriesTile";
import { getManufacturerById } from "@/fleet/queries";
import { log } from "@/logging";
import clsx from "clsx";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { serializeError } from "serialize-error";

type Params = Promise<
  Readonly<{
    manufacturerId: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const manufacturer = await getManufacturerById(
      (await props.params).manufacturerId,
    );
    if (!manufacturer) return {};

    return {
      title: `${manufacturer.name} - Schiffe | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/spynet/citizen/[id]/page.tsx",
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
  const manufacturer = await getManufacturerById(
    (await props.params).manufacturerId,
  );
  if (!manufacturer) notFound();

  return (
    <main className="flex gap-8 items-start flex-col xl:flex-row">
      <section className="rounded-2xl overflow-hidden w-full xl:w-[400px]">
        <ImageUpload
          resourceType="manufacturer"
          resourceId={manufacturer.id}
          resourceAttribute="imageId"
          imageId={manufacturer.image?.id}
          imageMimeType={manufacturer.image?.mimeType}
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
          pendingClassName="w-full h-32"
        />

        <div className="p-8 bg-neutral-800/50">
          <p className="font-bold mb-4">Hersteller</p>

          <dl className="mt-4">
            <dt className="text-neutral-500">Name</dt>
            <dd>
              <EditableManufacturerName manufacturer={manufacturer} />
            </dd>
          </dl>
        </div>
      </section>

      <Suspense fallback={<SkeletonTile className="w-full flex-1" />}>
        <SeriesTile
          manufacturerId={manufacturer.id}
          className="w-full flex-1"
        />
      </Suspense>
    </main>
  );
}
