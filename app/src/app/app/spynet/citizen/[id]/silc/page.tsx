import { requireAuthenticationPage } from "@/modules/auth/server";
import { Template } from "@/modules/citizen/components/Template";
import { getCitizenById } from "@/modules/citizen/queries";
import { SuspenseWithErrorBoundaryTile } from "@/modules/common/components/SuspenseWithErrorBoundaryTile";
import { log } from "@/modules/logging";
import { SilcTransactionsTable } from "@/modules/silc/components/SilcTransactionsTable";
import { type Metadata } from "next";
import { forbidden, notFound, unstable_rethrow } from "next/navigation";
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
      title: `SILC - ${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    unstable_rethrow(error);
    void log.error(
      "Error while generating metadata for /app/spynet/citizen/[id]/silc/page.tsx",
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
    "/app/spynet/citizen/[id]/silc",
  );
  if (!authentication.session.entity) forbidden();

  const entity = await getCitizenById((await props.params).id);
  if (!entity) notFound();

  if (entity.id === authentication.session.entity.id) {
    await authentication.authorizePage(
      "silcTransactionOfCurrentCitizen",
      "read",
    );
  } else {
    await authentication.authorizePage("silcTransactionOfOtherCitizen", "read");
  }

  return (
    <Template citizen={entity}>
      <SuspenseWithErrorBoundaryTile>
        <SilcTransactionsTable citizenId={entity.id} />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
