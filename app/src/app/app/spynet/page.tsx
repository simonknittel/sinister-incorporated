import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { SkeletonTile } from "@/common/components/SkeletonTile";
import { SpynetSearchTile } from "@/common/components/SpynetSearchTile/SpynetSearchTile";
import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { type Metadata } from "next";
import { Suspense } from "react";
import { ActivityTile } from "./_components/ActivityTile/ActivityTile";
import { CreateCitizen } from "./_components/CreateCitizen";
import { CreateOrganization } from "./_components/CreateOrganization";

export const metadata: Metadata = {
  title: "Spynet | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/spynet");

  const showCreateCitizen = authentication.authorize("citizen", "create");

  const showCreateOrganization = authentication.authorize(
    "organization",
    "create",
  );

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Spynet" withGlitch />
      </div>

      <div className="flex flex-col xl:flex-row-reverse gap-8 mt-8">
        <div className="flex flex-col gap-4 xl:w-[400px]">
          <h2 className="font-bold text-xl self-start">Suche</h2>

          {!(await dedupedGetUnleashFlag("DisableAlgolia")) && (
            <SpynetSearchTile />
          )}

          {(showCreateCitizen || showCreateOrganization) && (
            <div className="flex gap-4 justify-center">
              {showCreateCitizen && <CreateCitizen />}

              {showCreateOrganization && <CreateOrganization />}
            </div>
          )}
        </div>

        <Suspense fallback={<SkeletonTile className="flex-1" />}>
          <ActivityTile className="flex-1" />
        </Suspense>
      </div>
    </main>
  );
}
