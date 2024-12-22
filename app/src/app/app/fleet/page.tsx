import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import type { NextjsSearchParams } from "@/common/utils/searchParamsNextjsToURLSearchParams";
import searchParamsNextjsToURLSearchParams from "@/common/utils/searchParamsNextjsToURLSearchParams";
import { MyFleetTile } from "@/fleet/components/MyFleetTile";
import { OrgFleetTile } from "@/fleet/components/OrgFleetTile";
import { TileSkeleton } from "@/fleet/components/TileSkeleton";
import { type Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Flotte | S.A.M. - Sinister Incorporated",
};

type Props = Readonly<{
  searchParams: NextjsSearchParams;
}>;

export default async function Page({ searchParams }: Props) {
  const authentication = await authenticatePage("/app/fleet");
  const showOrgFleetTile = authentication.authorize("orgFleet", "read");
  const showMyFleetTile = authentication.authorize("ship", "manage");

  const urlSearchParams = searchParamsNextjsToURLSearchParams(searchParams);

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Flotte" withGlitch />
      </div>

      <div className="flex flex-col-reverse xl:flex-row gap-8 items-start mt-8">
        {showOrgFleetTile && (
          <Suspense fallback={<TileSkeleton className="w-full 2xl:flex-1" />}>
            <OrgFleetTile
              urlSearchParams={urlSearchParams}
              className="w-full 2xl:flex-1"
            />
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
