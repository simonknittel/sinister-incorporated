import { authenticatePage } from "@/auth/server";
import { CitizenNavigation } from "@/citizen/components/CitizenNavigation";
import { getCitizenById } from "@/citizen/queries";
import { Link } from "@/common/components/Link";
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

type Props = Readonly<{
  params: Params;
}>;

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
      </div>

      <CitizenNavigation
        active={`/app/spynet/citizen/${entity.id}/silc`}
        citizenId={entity.id}
        className="mt-2"
      />

      <Suspense fallback={<SkeletonTile className="mt-4" />}>
        <SilcTransactionsTable citizenId={entity.id} className="mt-4" />
      </Suspense>
    </main>
  );
}
