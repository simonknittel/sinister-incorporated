import { type Metadata } from "next";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Hero } from "~/app/_components/Hero";
import { getUnleashFlag } from "~/app/_lib/getUnleashFlag";

const Game = dynamic(() => import("./_components/Game/Game"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Meet the Care Bear | Sinister Incorporated",
};

export default async function Page() {
  if (!(await getUnleashFlag("EnableCareBearShooter"))) redirect("/dashboard");

  return (
    <div className="h-full bg-sinister-radial-gradient">
      <div className="py-8 text-center">
        <Hero text="Meet the Care Bear" />
      </div>

      <div className="flex">
        <main className="flex-1">
          <Suspense fallback={<>Loading ...</>}>
            <Game />
          </Suspense>
        </main>

        <aside className="w-[320px]">
          <h2>Highscore</h2>
        </aside>
      </div>
    </div>
  );
}
