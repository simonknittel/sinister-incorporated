import { authenticatePage } from "@/auth/server";
import { OrganizationMembershipHistory } from "@/citizen/components/OrganizationMembershipHistory";
import { OrganizationMembershipsTile } from "@/citizen/components/OrganizationMembershipsTile";
import { Template } from "@/citizen/components/Template";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { prisma } from "@/db";
import { log } from "@/logging";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
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
      title: `Organisationen - ${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/spynet/citizen/[id]/organizations/page.tsx",
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
  const authentication = await authenticatePage(
    "/app/spynet/citizen/[id]/organizations",
  );
  await authentication.authorizePage("organizationMembership", "read");

  const entity = await getEntity((await props.params).id);
  if (!entity) notFound();

  return (
    <Template citizen={entity}>
      <div className="flex flex-col gap-4">
        <SuspenseWithErrorBoundaryTile>
          <OrganizationMembershipsTile id={entity.id} />
        </SuspenseWithErrorBoundaryTile>

        <SuspenseWithErrorBoundaryTile>
          <OrganizationMembershipHistory id={entity.id} />
        </SuspenseWithErrorBoundaryTile>
      </div>
    </Template>
  );
}
