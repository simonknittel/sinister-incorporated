import { requireAuthenticationPage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { prisma } from "@/db";
import { log } from "@/logging";
import { ActivityTile } from "@/organizations/components/ActivityTile";
import { MembershipsTile } from "@/organizations/components/MembershipsTile";
import { OverviewTile } from "@/organizations/components/OverviewTile";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { serializeError } from "serialize-error";

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

type Params = Promise<
  Readonly<{
    id: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const organization = await getOrganization((await props.params).id);
    if (!organization) return {};

    return {
      title: `${organization.name} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/spynet/organization/[id]/page.tsx",
      {
        error: serializeError(error),
      },
    );

    return {
      title: `Error | S.A.M. - Sinister Incorporated`,
    };
  }
}

interface Props {
  readonly params: Params;
}

export default async function Page(props: Props) {
  const authentication = await requireAuthenticationPage(
    "/app/spynet/organization/[id]",
  );
  await authentication.authorizePage("organization", "read");

  const params = await props.params;

  const organization = await getOrganization(params.id);
  if (!organization) notFound();

  return (
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <div className="flex gap-2 font-bold text-xl">
        <Link
          href="/app/spynet"
          className="text-neutral-500 flex gap-1 items-center hover:text-neutral-300"
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
          <SuspenseWithErrorBoundaryTile className="md:w-1/2 3xl:self-start">
            <OverviewTile className="md:w-1/2 3xl:self-start" id={params.id} />
          </SuspenseWithErrorBoundaryTile>

          <SuspenseWithErrorBoundaryTile className="md:w-1/2 3xl:self-start">
            <MembershipsTile
              className="md:w-1/2 3xl:self-start"
              id={params.id}
            />
          </SuspenseWithErrorBoundaryTile>
        </div>

        <SuspenseWithErrorBoundaryTile className="flex-1">
          <ActivityTile className="flex-1 3xl:self-start" id={params.id} />
        </SuspenseWithErrorBoundaryTile>
      </div>
    </main>
  );
}
