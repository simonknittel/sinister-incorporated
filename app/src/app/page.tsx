import { type Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import LoginButtons from "./_components/LoginButtons";
import Note from "./_components/Note";

export const metadata: Metadata = {
  title: "Login | Sinister Incorporated",
};

interface Props {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Page({ searchParams }: Props) {
  const session = await getServerSession(authOptions);
  if (session) redirect("/events");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  return (
    <div className="h-full flex justify-center items-center">
      <main className="w-full max-w-md py-8">
        <h1 className="text-center text-4xl text-sinister-red font-bold">
          Sinister Incorporated
        </h1>

        <div className="flex flex-col gap-2 rounded bg-neutral-900 p-8 mx-8 mt-4">
          <LoginButtons activeProviders={activeProviders} />
        </div>

        {searchParams.error && (
          <Note
            className="mx-8 mt-4"
            message="Beim Anmelden ist ein Fehler aufgetreten."
          />
        )}
      </main>
    </div>
  );
}
