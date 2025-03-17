import { authenticatePage } from "@/auth/server";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { AuecConversionRateSetting } from "@/silc/components/AuecConversionRateSetting";
import { Template } from "@/silc/components/Template";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Einstellungen - SILC | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/silc/settings");
  await authentication.authorizePage("silcSetting", "manage");

  return (
    <Template>
      <Suspense fallback={<SkeletonTile className="max-w-3xl" />}>
        <AuecConversionRateSetting className="max-w-3xl" />
      </Suspense>
    </Template>
  );
}
