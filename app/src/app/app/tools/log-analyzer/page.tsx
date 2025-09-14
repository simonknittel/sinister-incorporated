import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { LogAnalyzerWrapper } from "@/log-analyzer/components/LogAnalyzerWrapper";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Analyzer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage(
    "/app/tools/log-analyzer",
  );
  await authentication.authorizePage("logAnalyzer", "read");

  const crashLogAnalyzer = await getUnleashFlag("CrashLogAnalyzer");

  return (
    <SuspenseWithErrorBoundaryTile>
      <LogAnalyzerWrapper crashLogAnalyzer={crashLogAnalyzer} />
    </SuspenseWithErrorBoundaryTile>
  );
}
