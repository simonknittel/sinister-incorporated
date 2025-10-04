import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { Link } from "@/modules/common/components/Link";
import { generateMetadataWithTryCatch } from "@/modules/common/utils/generateMetadataWithTryCatch";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { PhaseCollection } from "@/modules/silc/components/profit-distribution/PhaseCollection";
import { PhaseCompleted } from "@/modules/silc/components/profit-distribution/PhaseCompleted";
import { PhasePayout } from "@/modules/silc/components/profit-distribution/PhasePayout";
import { PhasePayoutPreparation } from "@/modules/silc/components/profit-distribution/PhasePayoutPreparation";
import { getProfitDistributionCycleById } from "@/modules/silc/queries";
import { CyclePhase } from "@/modules/silc/utils/getCurrentPhase";
import { notFound } from "next/navigation";
import { FaCog } from "react-icons/fa";

type Params = Promise<{
  id: string;
}>;

export const generateMetadata = generateMetadataWithTryCatch(
  async (props: { params: Params }) => {
    const cycleData = await getProfitDistributionCycleById(
      (await props.params).id,
    );
    if (!cycleData) notFound();

    return {
      title: `${cycleData.cycle.title} - Gewinnausschüttung - SILC | S.A.M. - Sinister Incorporated`,
    };
  },
);

export default async function Page({
  params,
}: PageProps<"/app/silc/profit-distribution/[id]">) {
  if (!(await getUnleashFlag(UNLEASH_FLAG.EnableProfitDistribution)))
    notFound();

  const authentication = await requireAuthenticationPage(
    "/app/silc/profit-distribution/[id]",
  );
  await authentication.authorizePage("profitDistributionCycle", "read");

  const cycleData = await getProfitDistributionCycleById((await params).id);
  if (!cycleData) notFound();

  const [hasProfitDistributionCycleManage] = await Promise.all([
    authentication.authorizePage("profitDistributionCycle", "manage"),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-9 flex-initial" />

        <h1 className="text-2xl font-bold text-center flex-1">
          {cycleData.cycle.title}
        </h1>

        {hasProfitDistributionCycleManage && (
          <Button2
            as={Link}
            href={`/app/silc/profit-distribution/${cycleData.cycle.id}/management`}
            variant="secondary"
            className="w-9 flex-initial"
            title="Verwalten"
          >
            <FaCog />
          </Button2>
        )}
      </div>

      {cycleData.currentPhase >= CyclePhase.Completed && (
        <PhaseCompleted cycleData={cycleData} />
      )}

      {cycleData.currentPhase >= CyclePhase.Payout && (
        <PhasePayout cycleData={cycleData} />
      )}

      {cycleData.currentPhase >= CyclePhase.PayoutPreparation && (
        <PhasePayoutPreparation cycleData={cycleData} />
      )}

      <PhaseCollection cycleData={cycleData} />
    </div>
  );
}
