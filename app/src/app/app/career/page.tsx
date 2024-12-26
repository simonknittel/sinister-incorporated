import { authenticatePage } from "@/auth/server";
import { Flow } from "@/career/components/Flow";
import { Hero } from "@/common/components/Hero";
import Note from "@/common/components/Note";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Karriere | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/career");
  await authentication.authorizePage("career", "read");

  return (
    <main className="p-4 pb-20 lg:p-8">
      <div className="flex justify-center">
        <Hero text="Karriere" withGlitch />
      </div>

      <Note
        message={
          <p>
            Dies ist ein Proof on Concept. Es sind noch nicht alle Funktionen
            implementiert und es kann zu Fehlern kommen.
          </p>
        }
        className="mt-8 mx-auto"
      />

      <div className="h-[1080px] bg-neutral-800/50 rounded-2xl overflow-hidden text-black mt-2">
        <Flow />
      </div>
    </main>
  );
}
