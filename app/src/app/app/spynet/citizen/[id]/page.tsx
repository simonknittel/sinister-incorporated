import { authenticatePage } from "@/auth/server";
import { CitizenNavigation } from "@/citizen/components/CitizenNavigation";
import { DeleteCitizen } from "@/citizen/components/DeleteCitizen";
import { OrganizationMembershipsTile } from "@/citizen/components/OrganizationMembershipsTile";
import { Overview } from "@/citizen/components/Overview";
import { OverviewSkeleton } from "@/citizen/components/OverviewSkeleton";
import { Roles } from "@/citizen/components/roles/Roles";
import { RolesSkeleton } from "@/citizen/components/roles/RolesSkeleton";
import { Link } from "@/common/components/Link";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { prisma } from "@/db";
import { log } from "@/logging";
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
      title: `${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
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
  const authentication = await authenticatePage("/app/spynet/citizen/[id]");
  await authentication.authorizePage("citizen", "read");

  const entity = await getEntity((await props.params).id);
  if (!entity) notFound();

  const [showDelete, showOrganizationMembershipsTile] = await Promise.all([
    authentication.authorize("citizen", "delete"),
    authentication.authorize("organizationMembership", "read"),
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
        active={`/app/spynet/citizen/${entity.id}`}
        citizenId={entity.id}
        className="mt-2"
      />

      <div className="mt-4 flex flex-col gap-4 md:flex-row 3xl:w-[720px]">
        <Suspense
          fallback={<OverviewSkeleton className="md:w-1/2 3xl:self-start" />}
        >
          <Overview entity={entity} className="md:w-1/2 3xl:self-start" />
        </Suspense>

        <div className="flex flex-col gap-4 md:w-1/2">
          <Suspense fallback={<RolesSkeleton />}>
            <Roles entity={entity} />
          </Suspense>

          {showOrganizationMembershipsTile && (
            <Suspense fallback={<SkeletonTile />}>
              <OrganizationMembershipsTile id={entity.id} />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
}
