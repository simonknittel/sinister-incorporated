import { authenticatePage } from "@/auth/server";
import { Overview } from "@/citizen/components/Overview";
import { Roles } from "@/citizen/components/roles/Roles";
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
      title: `${entity.handle || entity.id} - Spynet | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/spynet/citizen/[id]/page.tsx",
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
  const authentication = await authenticatePage("/app/spynet/citizen/[id]");
  await authentication.authorizePage("citizen", "read");

  const entity = await getCitizenById((await props.params).id);
  if (!entity) notFound();

  return (
    <Template citizen={entity}>
      <div className="flex flex-col gap-4 md:flex-row">
        <SuspenseWithErrorBoundaryTile className="md:w-1/2 3xl:self-start">
          <Overview entity={entity} className="md:w-1/2 3xl:self-start" />
        </SuspenseWithErrorBoundaryTile>

        <div className="flex flex-col gap-4 md:w-1/2">
          <SuspenseWithErrorBoundaryTile>
            <Roles entity={entity} />
          </SuspenseWithErrorBoundaryTile>
        </div>
      </div>
    </Template>
  );
}
