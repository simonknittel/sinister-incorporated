import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { serializeError } from "serialize-error";
import { authenticatePage } from "../../../../../lib/auth/server";
import { log } from "../../../../../lib/logging";
import { prisma } from "../../../../../server/db";
import { SkeletonTile } from "../../../../_components/SkeletonTile";
import { ActivityTile } from "./_components/ActivityTile";
import { MembershipsTile } from "./_components/MembershipsTile";
import { OverviewTile } from "./_components/OverviewTile";

const getOrganization = cache(async (id: string) => {
  return prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      name: true,
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
    const organization = await getOrganization(params.id);
    if (!organization) return {};

    return {
      title: `${organization.name} - Spynet | Sinister Incorporated`,
    };
  } catch (error) {
    log.error(
      "Error while generating metadata for /(app)/spynet/organization/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | Sinister Incorporated`,
    };
  }
}

type Props = Readonly<{
  params: Params;
}>;

export default async function Page({ params }: Props) {
  const authentication = await authenticatePage(
    "/app/spynet/organization/[id]",
  );
  authentication.authorizePage("organization", "read");

  const organization = await getOrganization(params.id);
  if (!organization) notFound();

  return (
    <main className="p-2 lg:p-8 pt-20 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
          prefetch={false}
        >
          Spynet
        </Link>

        <span className="text-neutral-500">/</span>

        <span className="text-neutral-500 flex gap-1 items-center">
          Organisation
        </span>

        <span className="text-neutral-500">/</span>

        <h1 className="overflow-hidden text-ellipsis whitespace-nowrap">
          {organization.name}
        </h1>

        {/* {authentication.authorize("organization", "delete") && <DeleteEntity entity={organization} />} */}
      </div>

      <div className="mt-4 flex flex-col 3xl:flex-row-reverse gap-8">
        <div className="flex flex-col gap-4 md:flex-row 3xl:w-[720px]">
          <Suspense
            fallback={<SkeletonTile className="md:w-1/2 3xl:self-start" />}
          >
            <OverviewTile className="md:w-1/2 3xl:self-start" id={params.id} />
          </Suspense>

          <Suspense
            fallback={<SkeletonTile className="md:w-1/2 3xl:self-start" />}
          >
            <MembershipsTile
              className="md:w-1/2 3xl:self-start"
              id={params.id}
            />
          </Suspense>
        </div>

        <Suspense fallback={<SkeletonTile className="flex-1" />}>
          <ActivityTile className="flex-1 3xl:self-start" id={params.id} />
        </Suspense>
      </div>
    </main>
  );
}
