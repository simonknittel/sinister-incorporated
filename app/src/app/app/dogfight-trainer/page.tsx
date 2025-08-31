import { authenticatePage } from "@/auth/server";
import { Button2 } from "@/common/components/Button2";
import { Link } from "@/common/components/Link";
import { type Metadata } from "next";
import { FaExternalLinkAlt, FaSpinner } from "react-icons/fa";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "SILO-Anfrage | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  await authenticatePage("/app/dogfight-trainer");

  return (
    <main className="pb-16 lg:px-2 lg:pb-2 relative">
      <iframe
        src="/dogfight-trainer"
        className="w-full h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4.75rem)] relative z-10"
        title="Formular für eine SILO-Anfrage"
      />

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <FaSpinner className="animate-spin text-5xl text-neutral-500" />
      </div>

      <Button2
        as={Link}
        href="/dogfight-trainer"
        title="In einem neuen Tab öffnen"
        variant="secondary"
        className="absolute right-3 top-1 z-10"
      >
        <FaExternalLinkAlt />
      </Button2>
    </main>
  );
}
