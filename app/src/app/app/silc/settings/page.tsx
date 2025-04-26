import { authenticatePage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile.tsx";
import { AuecConversionRateSetting } from "@/silc/components/AuecConversionRateSetting";
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
      <SuspenseWithErrorBoundaryTile>
        <AuecConversionRateSetting />
      </SuspenseWithErrorBoundaryTile>
    </Template>
  );
}
