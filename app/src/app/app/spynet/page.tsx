import { requireAuthenticationPage } from "@/auth/server";
import { CreateCitizenButton } from "@/citizen/components/CreateCitizenButton";
import { Hero } from "@/common/components/Hero";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { CreateOrganizationButton } from "@/spynet/components/CreateOrganization/CreateOrganizationButton";
import { SpynetSearchTile } from "@/spynet/components/SpynetSearchTile/SpynetSearchTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/spynet");

  const [showCreateCitizen, showCreateOrganization] = await Promise.all([
    authentication.authorize("citizen", "create"),
    authentication.authorize("organization", "create"),
  ]);

  return (
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Spynet" withGlitch size="md" />
      </div>

      <div className="max-w-[400px] mx-auto mt-6">
        {!(await getUnleashFlag("DisableAlgolia")) && <SpynetSearchTile />}

        {(showCreateCitizen || showCreateOrganization) && (
          <div className="flex gap-2 justify-center mt-4">
            {showCreateCitizen && <CreateCitizenButton />}

            {showCreateOrganization && <CreateOrganizationButton />}
          </div>
        )}
      </div>
    </main>
  );
}
