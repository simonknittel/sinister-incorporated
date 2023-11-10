import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";

const Game = dynamic(() => import("./_components/Game/Game"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Meet the Care Bear | Sinister Incorporated",
};

export default async function Page() {
  if (!(await getUnleashFlag("EnableCareBearShooter"))) redirect("/");

  return (
    <main className="h-full bg-sinister-radial-gradient">
      <Suspense fallback={<>Loading ...</>}>
        <Game />
      </Suspense>
    </main>
  );
}
