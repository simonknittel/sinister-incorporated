import { Link } from "@/common/components/Link";
import { ContainerCalculator } from "@/container-calculator/components/ContainerCalculator";
import { type Metadata } from "next";
import { FaChevronLeft } from "react-icons/fa";

export const metadata: Metadata = {
  title: "Container Calculator | S.A.M. - Sinister Incorporated",
};

export default function Page() {
  return (
    <main className="p-4 pb-20 lg:p-6">
      <Link
        href="/app/tools"
        className="text-sinister-red-500 hover:text-sinister-red-300 focus-visible:text-sinister-red-300 inline-flex items-center gap-2"
      >
        <FaChevronLeft />
        Alle Tools
      </Link>

      <ContainerCalculator className="mt-4" />
    </main>
  );
}
