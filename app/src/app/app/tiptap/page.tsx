import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { Tiptap } from "@/tiptap/components/Tiptap";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Tiptap | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/apps");
  await authentication.authorizePage("tiptap", "manage");

  return (
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Tiptap" withGlitch size="md" />
      </div>

      <Tiptap className="mt-4" />
    </main>
  );
}
