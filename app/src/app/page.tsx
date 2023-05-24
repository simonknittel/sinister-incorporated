import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import LoginButtons from "./_components/LoginButtons";
import Note from "./_components/Note";
import { authenticate } from "./_lib/auth/authenticateAndAuthorize";

export const metadata: Metadata = {
  title: "Sinister Incorporated - Hoist the Black",
  description: "",
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Props) {
  const authentication = await authenticate();
  if (authentication) redirect("/dashboard");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  return (
    <div className="h-full flex justify-center items-center bg-sinister-radial-gradient">
      <main className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <h1 className="text-center text-5xl lg:text-6xl text-sinister-red font-extrabold uppercase bg-clip-text text-transparent bg-sinister-text-gradient">
          Sinister Inc
        </h1>

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
