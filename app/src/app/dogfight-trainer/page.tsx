import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";

const Game = dynamic(() => import("./_components/Game/Game"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Dogfight Trainer | Sinister Incorporated",
};

export default async function Page() {
  if (!(await getUnleashFlag("EnableCareBearShooter"))) redirect("/");

  return (
    <main className="min-h-dvh bg-sinister-radial-gradient flex items-center justify-center relative">
      <Suspense fallback={<>Loading ...</>}>
        <Game />
      </Suspense>
    </main>
  );
}
