import { type Metadata } from "next";
import { Hero } from "~/app/_components/Hero";
import { authenticatePage } from "~/app/_lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";
import CreateEntity from "../_components/CreateEntity";
import Search from "./_components/Search";

export const metadata: Metadata = {
  title: "Suche - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  return (
    <main className="h-full flex justify-center items-center bg-sinister-radial-gradient">
      <div className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <Hero text="Spynet" />

        {!(await getUnleashFlag("DisableAlgolia")) && <Search />}

        {authentication.authorize([
          {
            resource: "citizen",
            operation: "create",
          },
        ]) && <CreateEntity />}
      </div>
    </main>
  );
}
