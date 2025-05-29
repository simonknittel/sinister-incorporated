import { authenticatePage } from "@/auth/server";
import { Link } from "@/common/components/Link";
import { LogAnalyzer } from "@/log-analyzer/components/LogAnalyzer";
import { type Metadata } from "next";
import { FaChevronLeft } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Log Analyzer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/tools/log-analyzer");
  await authentication.authorizePage("logAnalyzer", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <Link
        href="/app/tools"
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 inline-flex items-center gap-2"
      >
        <FaChevronLeft />
        Alle Tools
      </Link>

      <LogAnalyzer className="mt-4" />
    </main>
  );
}
