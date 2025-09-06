import { requireAuthenticationPage } from "@/auth/server";
import { SuspenseWithErrorBoundaryTile } from "@/common/components/SuspenseWithErrorBoundaryTile";
import { Tile } from "@/common/components/Tile";
import { AuecConversionRateSetting } from "@/silc/components/AuecConversionRateSetting";
import { RefreshSilcBalances } from "@/silc/components/RefreshSilcBalances";
import { RoleSalaries } from "@/silc/components/RoleSalaries";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Einstellungen - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await requireAuthenticationPage("/app/silc/settings");
  await authentication.authorizePage("silcSetting", "manage");

  const silcBalanceOfOtherCitizenManage = await authentication.authorize(
    "silcBalanceOfOtherCitizen",
    "manage",
  );

  return (
    <div className="flex flex-col gap-4">
      <SuspenseWithErrorBoundaryTile>
        <AuecConversionRateSetting />
      </SuspenseWithErrorBoundaryTile>

      <SuspenseWithErrorBoundaryTile>
        <RoleSalaries />
      </SuspenseWithErrorBoundaryTile>

      {silcBalanceOfOtherCitizenManage && (
        <Tile heading="Other">
          <RefreshSilcBalances />
        </Tile>
      )}
    </div>
  );
}
