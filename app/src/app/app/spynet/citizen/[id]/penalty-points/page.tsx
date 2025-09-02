import { requireAuthenticationPage } from "@/auth/server";
import { Template } from "@/citizen/components/Template";
import { getCitizenById } from "@/citizen/queries";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { log } from "@/logging";
import { EntriesOfCitizenTable } from "@/penalty-points/components/EntriesOfCitizenTable";
import { type Metadata } from "next";
import { forbidden, notFound } from "next/navigation";
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

interface Props {
  readonly params: Params;
}

export default async function Page(props: Props) {
  const authentication = await requireAuthenticationPage(
    "/app/spynet/citizen/[id]/penalty-points",
  );
  if (!authentication.session.entity) forbidden();

  const entity = await getCitizenById((await props.params).id);
  if (!entity) notFound();

  if (entity.id === authentication.session.entity.id) {
    await authentication.authorizePage("ownPenaltyEntry", "read");
  } else {
    await authentication.authorizePage("penaltyEntry", "read");
  }

  return (
    <Template citizen={entity}>
      <SuspenseWithErrorBoundaryTile>
        <EntriesOfCitizenTable citizenId={entity.id} />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
