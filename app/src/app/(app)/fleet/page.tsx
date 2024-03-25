import { type Metadata } from "next";
import { Suspense } from "react";
import { MdWorkspaces } from "react-icons/md";
import { authenticatePage } from "../../../_lib/auth/authenticateAndAuthorize";
import { MyFleetTile } from "./_components/MyFleetTile";
import { OrgFleetTile } from "./_components/OrgFleetTile";
import { TileSkeleton } from "./_components/TileSkeleton";

export const metadata: Metadata = {
  title: "Flotte | Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage();

  const showOrgFleetTile = authentication.authorize([
    {
      resource: "orgFleet",
      operation: "read",
    },
  ]);

  const showMyFleetTile = authentication.authorize([
    {
      resource: "ship",
      operation: "manage",
    },
  ]);

  return (
    <main className="p-2 lg:p-8 pt-20 max-w-[1920px] mx-auto">
      <h2 className="font-bold text-xl flex gap-2 items-center">
        <MdWorkspaces />
        Flotte
      </h2>

      <div className="flex flex-col-reverse xl:flex-row gap-8 items-start mt-4">
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
