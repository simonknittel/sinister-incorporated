import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { Hero } from "~/app/_components/Hero";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";

export const metadata: Metadata = {
  title: "Care Bear Huhn | Sinister Incorporated",
};

export default async function Page() {
  if (await getUnleashFlag("DisableCareBearHuhn")) redirect("/dashboard");

  return (
    <div className="h-full flex justify-center items-center bg-sinister-radial-gradient">
      <main className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <Hero text="Care Bear Huhn" />

        {/* TODO: Implement game */}
      </main>
    </div>
  );
}
