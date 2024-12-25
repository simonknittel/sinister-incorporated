import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { GameLoader } from "./_components/Game/GameLoader";

export const metadata: Metadata = {
  title: "Dogfight Trainer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  if (!(await dedupedGetUnleashFlag("EnableCareBearShooter"))) redirect("/");

  return (
    <main className="min-h-dvh bg-sinister-radial-gradient flex items-center justify-center relative">
      <Suspense fallback={<>Loading ...</>}>
        <GameLoader />
      </Suspense>
    </main>
  );
}
