import { App } from "@/apps/components/App";
import { AppGrid } from "@/apps/components/AppGrid";
import { RedactedApp } from "@/apps/components/RedactedApp";
import siloAnfrageScreenshot from "@/assets/silo-anfrage-screenshot.png";
import { authenticatePage } from "@/auth/server";
import careerScreenshot from "@/career/assets/screenshot.png";
import changelogScreenshot from "@/changelog/assets/screenshot.png";
import { Hero } from "@/common/components/Hero";
import cornerstoneImageBrowserScreenshot from "@/cornerstone-image-browser/assets/screenshot.png";
import dashboardScreenshot from "@/dashboard/assets/screenshot.png";
import documentsScreenshot from "@/documents/assets/screenshot.png";
import dogfightTrainerScreenshot from "@/dogfight-trainer/assets/screenshot.png";
import fleetScreenshot from "@/fleet/assets/screenshot.png";
import iamScreenshot from "@/iam/assets/screenshot.png";
import logAnalyzerScreenshot from "@/log-analyzer/assets/screenshot.png";
import penaltyPointsScreenshot from "@/penalty-points/assets/screenshot.png";
import silcScreenshot from "@/silc/assets/screenshot.png";
import spynetScreenshot from "@/spynet/assets/screenshot.png";
import tasksScreenshot from "@/tasks/assets/screenshot.png";
import { type Metadata } from "next";

export const revalidate = 86400; // 24 hours

export const metadata: Metadata = {
  title: "Apps | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/apps");

  const [
    showLogAnalyzer,
    showTasks,
    citizenRead,
    organizationRead,
    orgFleetRead,
    shipManage,
    careerReadSecurity,
    careerReadEconomic,
    careerReadManagement,
    careerReadTeam,
    showSilc,
    showPenaltyPoints,
    showRoleManage,
    showUserRead,
  ] = await Promise.all([
    authentication.authorize("logAnalyzer", "read"),
    authentication.authorize("task", "read"),
    authentication.authorize("citizen", "read"),
    authentication.authorize("organization", "read"),
    authentication.authorize("orgFleet", "read"),
    authentication.authorize("ship", "manage"),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "security",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "economic",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "management",
      },
    ]),
    authentication.authorize("career", "read", [
      {
        key: "flowId",
        value: "team",
      },
    ]),
    authentication.authorize("silcBalanceOfOtherCitizen", "read"),
    authentication.authorize("penaltyEntry", "create"),
    authentication.authorize("role", "manage"),
    authentication.authorize("user", "read"),
  ]);
  const showSpynet = citizenRead || organizationRead;
  const showFleet = orgFleetRead || shipManage;
  const showCareer =
    careerReadSecurity ||
    careerReadEconomic ||
    careerReadManagement ||
    careerReadTeam;

  const apps = [
    {
      name: "Dashboard",
      href: "/app",
      imageSrc: dashboardScreenshot,
      description: "Übersicht mit aktuellen Informationen",
      featured: true,
    },
    {
      name: "Dokumente",
      href: "/app/documents",
      imageSrc: documentsScreenshot,
      description: "Alles was du zu deinem nächsten Zertifikat wissen möchtest",
      featured: true,
    },
    {
      name: "Flotte",
      href: "/app/fleet",
      imageSrc: fleetScreenshot,
      description:
        "Verwalte deine Schiffe und erhalte eine Übersicht über unsere Org-Flotte",
      featured: true,
      redacted: !showFleet,
    },
    {
      name: "Karriere",
      href: "/app/career",
      imageSrc: careerScreenshot,
      description:
        "Org-interner Karrierebaum in unseren Bereichen Security und Economics",
      featured: true,
      redacted: !showCareer,
    },
    {
      name: "SILC",
      href: "/app/silc",
      imageSrc: silcScreenshot,
      description: "Übersicht und Verwaltung von SILC",
      featured: true,
      redacted: !showSilc,
    },
    {
      name: "SILO-Anfrage",
      href: "/app/silo-request",
      imageSrc: siloAnfrageScreenshot,
      description:
        "Hier kannst du Materialeinträge anmelden, aktuelle Angebote und Preislisten anfordern.",
      featured: true,
    },
    {
      name: "Spynet",
      href: "/app/spynet",
      imageSrc: spynetScreenshot,
      description: "Übersicht und Verwaltung von Citizen und Organisations",
      featured: true,
      redacted: !showSpynet,
    },
    {
      name: "Strafpunkte",
      href: "/app/penalty-points",
      imageSrc: penaltyPointsScreenshot,
      description: "Übersicht und Verwaltung von Strafpunkten",
      featured: true,
      redacted: !showPenaltyPoints,
    },
    {
      name: "Tasks",
      href: "/app/tasks",
      imageSrc: tasksScreenshot,
      description: "Org-internes Quest System",
      featured: true,
      redacted: !showTasks,
    },
    {
      name: "Cornerstone Image Browser",
      href: "/app/tools/cornerstone-image-browser",
      imageSrc: cornerstoneImageBrowserScreenshot,
      description:
        "Stellt die Bilder von Cornerstone nebeneinander dar, um sie visuell einfach vergleichen zu können.",
    },
    {
      name: "Dogfight Trainer",
      href: "/dogfight-trainer",
      imageSrc: dogfightTrainerScreenshot,
      description:
        "Zeige deinen Dogfight Skill in unserer Hommage an den Klassiker, Asteroids. Achte darauf was du abschießt!",
    },
    {
      name: "Log Analyzer",
      href: "/app/tools/log-analyzer",
      imageSrc: logAnalyzerScreenshot,
      description:
        "Wertet die Game Logs von Star Citizen aus um nach Kills zu filtern.",
      redacted: !showLogAnalyzer,
    },
    {
      name: "Changelog",
      href: "/app/changelog",
      imageSrc: changelogScreenshot,
      description: "Übersicht der letzten Änderungen im S.A.M.",
    },
    {
      name: "IAM",
      href: "/app/iam",
      imageSrc: iamScreenshot,
      description: "Übersicht und Verwaltung der Rollen und Benutzer.",
      redacted: !showRoleManage && !showUserRead,
    },
  ];

  const featuredApps = apps
    .filter((app) => app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const otherApps = apps
    .filter((app) => !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="p-4 pb-20 lg:pb-4 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Apps" withGlitch size="md" />
      </div>

      <h2 className="font-bold text-lg mt-8">Featured</h2>

      <AppGrid className="mt-2">
        {featuredApps.map((app) =>
          app.redacted ? (
            <RedactedApp key={app.name} />
          ) : (
            <App
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppGrid>

      <h2 className="font-bold text-lg mt-8">Weitere</h2>

      <AppGrid className="mt-2">
        {otherApps.map((app) =>
          app.redacted ? (
            <RedactedApp key={app.name} />
          ) : (
            <App
              key={app.name}
              name={app.name}
              href={app.href}
              imageSrc={app.imageSrc}
              description={app.description}
            />
          ),
        )}
      </AppGrid>
    </main>
  );
}
