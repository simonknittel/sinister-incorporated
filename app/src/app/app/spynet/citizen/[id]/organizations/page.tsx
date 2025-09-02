import { requireAuthenticationPage } from "@/auth/server";
import { OrganizationMembershipHistory } from "@/citizen/components/OrganizationMembershipHistory";
import { OrganizationMembershipsTile } from "@/citizen/components/OrganizationMembershipsTile";
import { Template } from "@/citizen/components/Template";
import { getCitizenById } from "@/citizen/queries";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { log } from "@/logging";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { serializeError } from "serialize-error";

type Params = Promise<
  Readonly<{
    id: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const entity = await getCitizenById((await props.params).id);
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
  const authentication = await requireAuthenticationPage(
    "/app/spynet/citizen/[id]/organizations",
  );
  await authentication.authorizePage("organizationMembership", "read");

  const entity = await getCitizenById((await props.params).id);
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
