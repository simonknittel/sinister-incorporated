import { type Metadata } from "next";
import { authenticatePage } from "../../../../lib/auth/authenticateAndAuthorize";
import { getUnleashFlag } from "../../../../lib/getUnleashFlag";
import { Hero } from "../../../_components/Hero";
import { CreateCitizen } from "../_components/CreateCitizen";
import { CreateOrganization } from "../_components/CreateOrganization";
import Search from "./_components/Search";

export const metadata: Metadata = {
  title: "Suche - Spynet | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/spynet/search");
  authentication.authorizePage([
    {
      resource: "citizen",
      operation: "read",
    },
  ]);

  const showCreateCitizen = authentication.authorize([
    {
      resource: "citizen",
      operation: "create",
    },
  ]);

  const showCreateOrganization =
    (await getUnleashFlag("EnableOrganizations")) &&
    authentication.authorize([
      {
        resource: "organization",
        operation: "create",
      },
    ]);

  return (
    <main className="min-h-dvh flex justify-center items-center">
      <div className="w-full max-w-md py-8 flex flex-col items-center gap-4">
        <Hero text="Spynet" />

        {!(await getUnleashFlag("DisableAlgolia")) && <Search />}

        {(showCreateCitizen || showCreateOrganization) && (
          <div className="flex gap-8">
            {showCreateCitizen && <CreateCitizen />}

            {showCreateOrganization && <CreateOrganization />}
          </div>
        )}
      </div>
    </main>
  );
}
