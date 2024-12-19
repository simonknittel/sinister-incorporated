import { authenticatePage } from "@/auth/server";
import { type Metadata } from "next";
import { Suspense } from "react";
import { dedupedGetUnleashFlag } from "../../../lib/getUnleashFlag";
import { Hero } from "../../_components/Hero";
import { SkeletonTile } from "../../_components/SkeletonTile";
import { SpynetSearchTile } from "../../_components/SpynetSearchTile/SpynetSearchTile";
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
        <Hero text="Spynet" />
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
