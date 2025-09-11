import { requireAuthenticationPage } from "@/modules/auth/server";
import { CreateCitizenButton } from "@/modules/citizen/components/CreateCitizenButton";
import { MaxWidthContent } from "@/modules/common/components/layouts/MaxWidthContent";
import { getUnleashFlag } from "@/modules/common/utils/getUnleashFlag";
import { CreateOrganizationButton } from "@/modules/spynet/components/CreateOrganization/CreateOrganizationButton";
import { SpynetSearchTile } from "@/modules/spynet/components/SpynetSearchTile/SpynetSearchTile";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/spynet");

  const [citizenCreate, organisationCreate] = await Promise.all([
    authentication.authorize("citizen", "create"),
    authentication.authorize("organization", "create"),
  ]);

  return (
    <MaxWidthContent>
      <div className="max-w-[400px] mx-auto">
        {!(await getUnleashFlag("DisableAlgolia")) && <SpynetSearchTile />}

        {(citizenCreate || organisationCreate) && (
          <div className="flex gap-2 justify-center mt-4">
            {citizenCreate && <CreateCitizenButton />}
            {organisationCreate && <CreateOrganizationButton />}
          </div>
        )}
      </div>
    </MaxWidthContent>
  );
}
