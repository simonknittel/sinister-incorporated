import { authenticatePage } from "@/auth/server";
import { CitizenNavigation } from "@/citizen/components/CitizenNavigation";
import { DeleteCitizen } from "@/citizen/components/DeleteCitizen";
import { Link } from "@/common/components/Link";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { prisma } from "@/db";
import { log } from "@/logging";
import { EntriesOfCitizenTable } from "@/penalty-points/components/EntriesOfCitizenTable";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { serializeError } from "serialize-error";

const getEntity = cache(async (id: string) => {
  return prisma.entity.findUnique({
    where: {
      id,
    },
  });
});

type Params = Promise<
  Readonly<{
    id: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const entity = await getEntity((await props.params).id);
    if (!entity) return {};

    return {
      title: `Strafpunkte - ${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/spynet/citizen/[id]/penalty-points/page.tsx",
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
  const authentication = await authenticatePage(
    "/app/spynet/citizen/[id]/penalty-points",
  );

  const entity = await getEntity((await props.params).id);
  if (!entity) notFound();

  if (entity.id === authentication.session.entityId) {
    await authentication.authorizePage("ownPenaltyEntry", "read");
  } else {
    await authentication.authorizePage("penaltyEntry", "read");
  }

  const [showDelete] = await Promise.all([
    authentication.authorize("citizen", "delete"),
  ]);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <span className="text-neutral-500 flex gap-1 items-center">
          Citizen
        </span>

        <span className="text-neutral-500">/</span>

        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap">
          {entity.handle || entity.id}
        </h1>

        {showDelete && <DeleteCitizen entity={entity} />}
      </div>

      <CitizenNavigation
        active={`/app/spynet/citizen/${entity.id}/penalty-points`}
        citizenId={entity.id}
        className="mt-2"
      />

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <EntriesOfCitizenTable citizenId={entity.id} className="mt-4" />
      </Suspense>
    </main>
  );
}
