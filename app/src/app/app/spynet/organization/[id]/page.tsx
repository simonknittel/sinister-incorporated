import { type Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, cache } from "react";
import { FaSitemap } from "react-icons/fa";
import { serializeError } from "serialize-error";
import { authenticatePage } from "../../../../../lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "../../../../../lib/getUnleashFlag";
import { log } from "../../../../../lib/logging";
import { prisma } from "../../../../../server/db";
import { Wip } from "../../../../_components/Wip";
import { ActivityTile } from "./_components/ActivityTile";
import { OverviewTile } from "./_components/OverviewTile";
import { Skeleton } from "./_components/Skeleton";

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
    if (!(await getUnleashFlag("EnableOrganizations"))) return {};

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
  if (!(await getUnleashFlag("EnableOrganizations"))) notFound();

  const authentication = await authenticatePage(
    "/app/spynet/organization/[id]",
  );
  authentication.authorizePage([
    {
      resource: "organization",
      operation: "read",
    },
  ]);

  const organization = await getOrganization(params.id);
  if (!organization) notFound();

  return (
    <main className="p-2 lg:p-8 pt-20 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet/search"
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

        {/* {authentication.authorize([
          {
            resource: "organization",
            operation: "delete",
          },
        ]) && <DeleteEntity entity={organization} />} */}
      </div>

      <div className="mt-4 flex flex-col 3xl:flex-row-reverse gap-8">
        <div className="flex flex-col gap-4 md:flex-row 3xl:w-[720px]">
          <Suspense fallback={<Skeleton className="md:w-1/2" />}>
            <OverviewTile className="md:w-1/2" id={params.id} />
          </Suspense>

          <section className="md:w-1/2 rounded-2xl p-4 lg:p-8 bg-neutral-800/50 flex flex-col">
            <h2 className="font-bold flex gap-2 items-center mb-8">
              <FaSitemap /> Mitglieder
            </h2>

            <Wip />
          </section>
        </div>

        <Suspense fallback={<Skeleton className="flex-1" />}>
          <ActivityTile className="flex-1 3xl:self-start" id={params.id} />
        </Suspense>
      </div>
    </main>
  );
}
