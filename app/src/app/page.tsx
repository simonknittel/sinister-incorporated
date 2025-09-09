import { authenticate } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { LoginButtons } from "@/common/components/LoginButtons";
import Note from "@/common/components/Note";
import { UwuHero } from "@/common/components/UwuHero";
import { searchParamsNextjsToURLSearchParams } from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { Footer } from "@/shell/components/Footer";
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { authOptions } from "../auth/server/auth";

export const metadata: Metadata = {
  title: "S.A.M. - Sinister Incorporated",
  description:
    "Sinister Administration Module (S.A.M.) of the Star Citizen organization Sinister Incorporated",
};

export default async function Page({ searchParams }: PageProps<"/">) {
  const authentication = await authenticate();
  if (authentication) redirect("/app");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  const urlSearchParams =
    await searchParamsNextjsToURLSearchParams(searchParams);
  const showUwuHero = urlSearchParams.has("uwu");

  return (
    <div className="min-h-dvh flex-col flex justify-center items-center background-primary">
      <main className="w-full max-w-md py-8 flex flex-col justify-center items-center gap-4 flex-1">
        {showUwuHero ? <UwuHero /> : <Hero text="S.A.M." withGlitch />}

        <div className="flex flex-col gap-2 max-w-xs">
          <LoginButtons activeProviders={activeProviders} />
        </div>

        {urlSearchParams.has("error") && (
          <Note
            className="max-w-xs lg:!p-4"
            message="Beim Anmelden ist ein Fehler aufgetreten."
          />
        )}
      </main>

      <Footer className="p-4" />
    </div>
  );
}
