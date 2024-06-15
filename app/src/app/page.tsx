import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { authenticate } from "../lib/auth/server";
import { authOptions } from "../server/auth";
import { Footer } from "./_components/Footer";
import { Hero } from "./_components/Hero";
import LoginButtons from "./_components/LoginButtons";
import Note from "./_components/Note";
import { UwuHero } from "./_components/UwuHero";

export const metadata: Metadata = {
  title: "S.A.M. - Sinister Incorporated",
  description:
    "Sinister Administration Module (S.A.M.) of the Star Citizen organization Sinister Incorporated",
};

type Props = Readonly<{
  searchParams: { [key: string]: string | string[] | undefined };
}>;

export default async function Page({ searchParams }: Props) {
  const authentication = await authenticate();
  if (authentication) redirect("/app");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  const showUwuHero = Object.hasOwn(searchParams, "uwu");

  return (
    <div className="min-h-dvh flex-col flex justify-center items-center bg-sinister-radial-gradient">
      <main className="w-full max-w-md py-8 flex flex-col justify-center items-center gap-4 flex-1">
        {showUwuHero ? <UwuHero /> : <Hero text="S.A.M." />}

        <div className="flex flex-col gap-2 rounded max-w-xs">
          <LoginButtons activeProviders={activeProviders} />
        </div>

        {searchParams.error && (
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
