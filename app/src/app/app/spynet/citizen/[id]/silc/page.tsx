import { authenticatePage } from "@/auth/server";
import { Template } from "@/citizen/components/Template";
import { getCitizenById } from "@/citizen/queries";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { log } from "@/logging";
import { SilcTransactionsTable } from "@/silc/components/SilcTransactionsTable";
import { type Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
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
  const authentication = await authenticatePage(
    "/app/spynet/citizen/[id]/silc",
  );

  const entity = await getCitizenById((await props.params).id);
  if (!entity) notFound();

  if (entity.id === authentication.session.entityId) {
    await authentication.authorizePage(
      "silcTransactionOfCurrentCitizen",
      "read",
    );
  } else {
    await authentication.authorizePage("silcTransactionOfOtherCitizen", "read");
  }

  return (
    <Template citizen={entity}>
      <Suspense fallback={<SkeletonTile />}>
        <SilcTransactionsTable citizenId={entity.id} />
      </Suspense>
    </Template>
  );
}
