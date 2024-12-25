import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { type Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import introductionCompendium from "./_assets/introduction_compendium.png";

export const metadata: Metadata = {
  title: "Dokumente | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/documents");
  await authentication.authorizePage("documentIntroductionCompendium", "read");

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Dokumente" withGlitch />
      </div>

      <div className="flex flex-col gap-8 items-center mt-8">
        <Link
          href="https://downloads.sinister-incorporated.de/introduction.pdf"
          className="block"
        >
          <Image
            src={introductionCompendium}
            alt="Einführungskompendium"
            width={720}
            height={405}
          />
        </Link>
      </div>
    </main>
  );
}
