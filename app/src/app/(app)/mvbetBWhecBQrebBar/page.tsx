import clsx from "clsx";
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
    <div className={clsx("h-full bg-sinister-radial-gradient", styles.grid)}>
      <div className={clsx("py-8 text-center", styles.hero)}>
        <Hero text="Meet the Care Bear" />
      </div>

      <main className={clsx(styles.game)}>
        <Suspense fallback={<>Loading ...</>}>
          <Game />
        </Suspense>
      </main>

      <aside className={clsx(styles.highscore)}>
        <h2>Highscore</h2>
      </aside>
    </div>
  );
}
