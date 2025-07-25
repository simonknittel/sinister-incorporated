import { authenticatePage } from "@/auth/server";
import { Flow } from "@/career/components/Flow";
import { Navigation } from "@/career/components/Navigation";
import { getMyReadableFlows } from "@/career/queries";
import { Hero } from "@/common/components/Hero";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { log } from "@/logging";
import { getRoles } from "@/roles/queries";
import { getMyAssignedRoles, getVisibleRoles } from "@/roles/utils/getRoles";
import { type Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { serializeError } from "serialize-error";

type Params = Promise<
  Readonly<{
    flowId: string;
  }>
>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  try {
    const flowId = (await props.params).flowId;
    const flows = await getMyReadableFlows();
    const flow = flows.find((flow) => flow.id === flowId);
    if (!flow) {
    }

    return {
      title: `${flow?.name} - Karriere | S.A.M. - Sinister Incorporated`,
    };
  } catch (error) {
    void log.error(
      "Error while generating metadata for /app/career/[flowId]/page.tsx",
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

export default async function Page({ params }: Props) {
  const { flowId } = await params;

  const authentication = await authenticatePage("/app/career");
  await authentication.authorizePage("career", "read", [
    {
      key: "flowId",
      value: flowId,
    },
  ]);

  const flows = await getMyReadableFlows();
  const flow = flows.find((flow) => flow.id === flowId);
  if (!flow) notFound();

  const canUpdate = await authentication.authorize("career", "update", [
    {
      key: "flowId",
      value: flowId,
    },
  ]);

  const isUpdating =
    canUpdate && (await cookies()).get("is_updating_flow")?.value === flowId;

  const [roles, assignedRoles] = await Promise.all([
    isUpdating ? getRoles() : getVisibleRoles(),
    getMyAssignedRoles(),
  ]);

  const additionalData = {
    roles,
    assignedRoles,
  };

  return (
    <main className="p-4 pb-20 lg:p-6">
      <div className="flex justify-center">
        <Hero text="Karriere" withGlitch size="md" />
      </div>

      <Navigation flows={flows} className="mt-2" />

      <SuspenseWithErrorBoundaryTile className="h-[1080px] mt-3">
        <div className="h-[1080px] bg-neutral-800/50 rounded-primary overflow-hidden text-black mt-3 relative">
          <Flow
            flow={flow}
            canUpdate={canUpdate}
            isUpdating={isUpdating}
            additionalData={additionalData}
          />
        </div>
      </SuspenseWithErrorBoundaryTile>
    </main>
  );
}
