import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { authenticate } from "../lib/auth/authenticateAndAuthorize";
import { authOptions } from "../server/auth";
import { Hero } from "./_components/Hero";
import LoginButtons from "./_components/LoginButtons";
import Note from "./_components/Note";

export const metadata: Metadata = {
  title: "Sinister Incorporated - Hoist the Black",
  description: "",
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Readonly<Props>) {
  const authentication = await authenticate();
  if (authentication) redirect("/app");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  return (
    <div className="min-h-dvh flex justify-center items-center bg-sinister-radial-gradient">
      <main className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <Hero text="Sinister Inc" />

        <div className="flex flex-col gap-2 rounded max-w-xs w-full">
          <LoginButtons activeProviders={activeProviders} />
        </div>

        {searchParams.error && (
          <Note
            className="max-w-xs lg:!p-4"
            message="Beim Anmelden ist ein Fehler aufgetreten."
          />
        )}
      </main>
    </div>
  );
}
