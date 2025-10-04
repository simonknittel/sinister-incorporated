import { requireAuthenticationPage } from "@/modules/auth/server";
import { Button2 } from "@/modules/common/components/Button2";
import { Link } from "@/modules/common/components/Link";
import { generateMetadataWithTryCatch } from "@/modules/common/utils/generateMetadataWithTryCatch";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { UNLEASH_FLAG } from "@/modules/common/utils/UNLEASH_FLAG";
import { PhaseManagementCollection } from "@/modules/silc/components/profit-distribution/PhaseManagementCollection";
import { PhaseManagementCompleted } from "@/modules/silc/components/profit-distribution/PhaseManagementCompleted";
import { PhaseManagementPayout } from "@/modules/silc/components/profit-distribution/PhaseManagementPayout";
import { PhaseManagementPayoutPreparation } from "@/modules/silc/components/profit-distribution/PhaseManagementPayoutPreparation";
import { getProfitDistributionCycleById } from "@/modules/silc/queries";
import { CyclePhase } from "@/modules/silc/utils/getCurrentPhase";
import { notFound } from "next/navigation";
import { FaChevronLeft } from "react-icons/fa";

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
  await authentication.authorizePage("profitDistributionCycle", "manage");

  const cycleData = await getProfitDistributionCycleById((await params).id);
  if (!cycleData) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-9 flex-initial" />

        <h1 className="flex-1 text-2xl font-bold text-center">
          {cycleData.cycle.title}
        </h1>
        {/* TODO: Implement edit button */}

        <Button2
          as={Link}
          href={`/app/silc/profit-distribution/${cycleData.cycle.id}`}
          variant="secondary"
          className="w-9 flex-initial"
          title="Zurück"
        >
          <FaChevronLeft />
        </Button2>
      </div>

      <p className="text-neutral-500 text-sm text-center">Verwaltung</p>

      {cycleData.currentPhase >= CyclePhase.Completed && (
        <PhaseManagementCompleted cycleData={cycleData} />
      )}

      {cycleData.currentPhase >= CyclePhase.Payout && (
        <PhaseManagementPayout cycleData={cycleData} />
      )}

      {cycleData.currentPhase >= CyclePhase.PayoutPreparation && (
        <PhaseManagementPayoutPreparation cycleData={cycleData} />
      )}

      <PhaseManagementCollection cycleData={cycleData} />
    </div>
  );
}
