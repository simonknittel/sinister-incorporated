import { requireAuthenticationPage } from "@/auth/server";
import { Flow } from "@/career/components/Flow";
import { getMyReadableFlows } from "@/career/queries";
import { getCitizensGroupedByVisibleRoles } from "@/citizen/queries";
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

  const authentication = await requireAuthenticationPage("/app/career");
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

  const [roles, assignedRoles, citizensGroupedByVisibleRoles] =
    await Promise.all([
      isUpdating ? getRoles() : getVisibleRoles(),
      getMyAssignedRoles(),
      getCitizensGroupedByVisibleRoles(),
    ]);

  const additionalData = {
    roles,
    assignedRoles,
    citizensGroupedByVisibleRoles,
  };

  return (
    <SuspenseWithErrorBoundaryTile className="h-[calc(100dvh-64px-48px)] lg:h-[calc(100dvh-104px)]">
      <div className="h-[calc(100dvh-64px-48px)] lg:h-[calc(100dvh-104px)] bg-neutral-800/50 rounded-primary overflow-hidden text-black relative">
        <Flow
          flow={flow}
          canUpdate={canUpdate}
          isUpdating={isUpdating}
          additionalData={additionalData}
        />
      </div>
    </SuspenseWithErrorBoundaryTile>
  );
}
