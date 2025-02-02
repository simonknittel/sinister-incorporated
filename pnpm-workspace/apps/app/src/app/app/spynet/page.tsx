import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { CreateCitizen } from "@/spynet/components/CreateCitizen";
import { CreateOrganization } from "@/spynet/components/CreateOrganization";
import { SpynetSearchTile } from "@/spynet/components/SpynetSearchTile/SpynetSearchTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/spynet");

  const showCreateCitizen = await authentication.authorize("citizen", "create");
  const showCreateOrganization = await authentication.authorize(
    "organization",
    "create",
  );

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Spynet" withGlitch />
      </div>

      <div className="max-w-[400px] mx-auto mt-8">
        {!(await getUnleashFlag("DisableAlgolia")) && <SpynetSearchTile />}

        {(showCreateCitizen || showCreateOrganization) && (
          <div className="flex gap-4 justify-center mt-4">
            {showCreateCitizen && <CreateCitizen />}

            {showCreateOrganization && <CreateOrganization />}
          </div>
        )}
      </div>
    </main>
  );
}
