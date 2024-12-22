import { dedupedGetUnleashFlag } from "@/common/utils/getUnleashFlag";
import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const Game = dynamic(() => import("./_components/Game/Game"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Dogfight Trainer | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  if (!(await dedupedGetUnleashFlag("EnableCareBearShooter"))) redirect("/");

  return (
    <main className="min-h-dvh bg-sinister-radial-gradient flex items-center justify-center relative">
      <Suspense fallback={<>Loading ...</>}>
        <Game />
      </Suspense>
    </main>
  );
}
