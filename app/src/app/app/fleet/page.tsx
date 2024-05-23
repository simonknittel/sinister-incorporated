import { type Metadata } from "next";
import { Suspense } from "react";
import { authenticatePage } from "../../../lib/auth/server";
import { Hero } from "../../_components/Hero";
import { MyFleetTile } from "./_components/MyFleetTile";
import { OrgFleetTile } from "./_components/OrgFleetTile";
import { TileSkeleton } from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Flotte | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/fleet");

  const showOrgFleetTile = authentication.authorize("orgFleet", "read");

  const showMyFleetTile = authentication.authorize("ship", "manage");

  return (
    <main className="pb-20 p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Flotte" />
      </div>

      <div className="flex flex-col-reverse xl:flex-row gap-8 items-start mt-8">
        {showOrgFleetTile && (
          <Suspense fallback={<TileSkeleton className="w-full 2xl:flex-1" />}>
            <OrgFleetTile className="w-full 2xl:flex-1" />
          </Suspense>
        )}

        {showMyFleetTile && (
          <Suspense
            fallback={<TileSkeleton className="w-full 2xl:w-[480px]" />}
          >
            <MyFleetTile className="w-full 2xl:w-[480px]" />
          </Suspense>
        )}
      </div>
    </main>
  );
}
