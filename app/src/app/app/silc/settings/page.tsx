import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { AuecConversionRateSetting } from "@/silc/components/AuecConversionRateSetting";
import { RoleSalaries } from "@/silc/components/RoleSalarySetting";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Einstellungen - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc/settings");
  await authentication.authorizePage("silcSetting", "manage");

  return (
    <Template>
      <div className="flex flex-col gap-4">
        <SuspenseWithErrorBoundaryTile>
          <AuecConversionRateSetting />
        </SuspenseWithErrorBoundaryTile>

        <SuspenseWithErrorBoundaryTile>
          <RoleSalaries />
        </SuspenseWithErrorBoundaryTile>
      </div>
    </Template>
  );
}
