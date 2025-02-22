import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { Link } from "@/common/components/Link";
import allianceManifest from "@/documents/assets/alliance_manifest.png";
import introductionCompendium from "@/documents/assets/introduction_compendium.png";
import { type Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dokumente | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/documents");
  if (
    !(await authentication.authorize(
      "documentIntroductionCompendium",
      "read",
    )) &&
    !(await authentication.authorize("documentAllianceManifest", "read"))
  )
    redirect("/app/forbidden");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Dokumente" withGlitch />
      </div>

      <div className="flex flex-col gap-8 items-center mt-8">
        {(await authentication.authorize(
          "documentIntroductionCompendium",
          "read",
        )) && (
          <Link
            href="https://downloads.sinister-incorporated.de/introduction.pdf"
            className="block"
            rel="noreferrer"
          >
            <Image
              src={introductionCompendium}
              alt="Einführungskompendium"
              width={720}
              height={405}
            />
          </Link>
        )}

        {(await authentication.authorize(
          "documentAllianceManifest",
          "read",
        )) && (
          <Link
            href="https://downloads.sinister-incorporated.de/alliance.pdf"
            className="block"
            rel="noreferrer"
          >
            <Image
              src={allianceManifest}
              alt="Alliance Manifest"
              width={720}
              height={405}
            />
          </Link>
        )}
      </div>
    </main>
  );
}
