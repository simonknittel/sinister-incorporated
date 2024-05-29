import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { serializeError } from "serialize-error";
import { authenticatePage } from "../../../../../lib/auth/server";
import { log } from "../../../../../lib/logging";
import { prisma } from "../../../../../server/db";
import { SkeletonTile } from "../../../../_components/SkeletonTile";
import DeleteEntity from "./_components/DeleteEntity";
import { OrganizationMembershipsTile } from "./_components/OrganizationMembershipsTile";
import { Overview } from "./_components/Overview";
import { OverviewSkeleton } from "./_components/OverviewSkeleton";
import { Notes } from "./_components/notes/Notes";
import { NotesSkeleton } from "./_components/notes/NotesSkeleton";
import { Roles } from "./_components/roles/Roles";
import { RolesSkeleton } from "./_components/roles/RolesSkeleton";

const getEntity = cache(async (id: string) => {
  return prisma.entity.findUnique({
    where: {
      id,
    },
  });
});

type Params = Readonly<{
  id: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  try {
    const entity = await getEntity(params.id);
    if (!entity) return {};

    return {
      title: `${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    await log.error(
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
  const authentication = await authenticatePage("/app/spynet/entity/[id]");
  authentication.authorizePage("citizen", "read");

  const entity = await getEntity(params.id);
  if (!entity) notFound();

  const showOrganizationMembershipsTile = authentication.authorize(
    "organizationMembership",
    "read",
  );

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

        {authentication.authorize("citizen", "delete") && (
          <DeleteEntity entity={entity} />
        )}
      </div>

      <div className="mt-4 flex flex-col 3xl:flex-row-reverse gap-8">
        <div className="flex flex-col gap-4 md:flex-row 3xl:w-[720px]">
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

        <Suspense fallback={<NotesSkeleton />}>
          <Notes entity={entity} className="flex-1 self-start" />
        </Suspense>
      </div>
    </main>
  );
}
