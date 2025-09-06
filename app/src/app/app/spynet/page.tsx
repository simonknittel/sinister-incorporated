import { requireAuthenticationPage } from "@/auth/server";
import { CreateCitizenButton } from "@/citizen/components/CreateCitizenButton";
import { getUnleashFlag } from "@/common/utils/getUnleashFlag";
import { CreateOrganizationButton } from "@/spynet/components/CreateOrganization/CreateOrganizationButton";
import { SpynetSearchTile } from "@/spynet/components/SpynetSearchTile/SpynetSearchTile";
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
    <div className="max-w-[400px] mx-auto mt-6">
      {!(await getUnleashFlag("DisableAlgolia")) && <SpynetSearchTile />}

      {(citizenCreate || organisationCreate) && (
        <div className="flex gap-2 justify-center mt-4">
          {citizenCreate && <CreateCitizenButton />}
          {organisationCreate && <CreateOrganizationButton />}
        </div>
      )}
    </div>
  );
}
