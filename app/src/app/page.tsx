import { type Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "~/server/auth";
import LoginButtons from "./_components/LoginButtons";

export const metadata: Metadata = {
  title: "Login | Sinister Incorporated",
};

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/events");

  const activeProviders = authOptions.providers.map((provider) => provider.id);

  return (
    <div className="min-h-screen flex justify-center items-center">
      <main className="w-full max-w-md py-8">
        <h1 className="mb-4 text-center text-4xl text-sinister-red font-bold">
          Sinister Incorporated
        </h1>

        <div className="flex flex-col gap-2 rounded bg-neutral-900 p-8 mx-8">
          <LoginButtons activeProviders={activeProviders} />
        </div>
      </main>
    </div>
  );
}
