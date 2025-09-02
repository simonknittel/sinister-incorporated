import siloAnfrageScreenshot from "@/assets/silo-anfrage-screenshot.png";
import careerScreenshot from "@/career/assets/screenshot.png";
import changelogScreenshot from "@/changelog/assets/screenshot.png";
import cornerstoneImageBrowserScreenshot from "@/cornerstone-image-browser/assets/screenshot.png";
import dashboardScreenshot from "@/dashboard/assets/screenshot.png";
import documentsScreenshot from "@/documents/assets/screenshot.png";
import dogfightTrainerScreenshot from "@/dogfight-trainer/assets/screenshot.png";
import eventsScreenshot from "@/events/assets/screenshot.png";
import fleetScreenshot from "@/fleet/assets/screenshot.png";
import iamScreenshot from "@/iam/assets/screenshot.png";
import logAnalyzerScreenshot from "@/log-analyzer/assets/screenshot.png";
import penaltyPointsScreenshot from "@/penalty-points/assets/screenshot.png";
import silcScreenshot from "@/silc/assets/screenshot.png";
import spynetScreenshot from "@/spynet/assets/screenshot.png";
import tasksScreenshot from "@/tasks/assets/screenshot.png";
import type { Session } from "next-auth";
import type { StaticImageData } from "next/image";

interface App {
  name: string;
  href: string;
  imageSrc: StaticImageData;
  description: string;
  featured?: boolean;
  redacted?: boolean;
}

export const apps = ([
  careerReadEconomic,
  careerReadManagement,
  careerReadSecurity,
  careerReadTeam,
  citizenRead,
  eventRead,
  logAnalyzerRead,
  organizationRead,
  orgFleetRead,
  penaltyEntryRead,
  roleManage,
  shipManage,
  silcBalanceOfOtherCitizenRead,
  taskRead,
  userRead,
]: (boolean | Session)[]) => {
  const apps: App[] = [
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
      name: "Events",
      href: "/app/events",
      imageSrc: eventsScreenshot,
      description: "Übersicht aller anstehenden und vergangenen Events",
      featured: true,
      redacted: !eventRead,
    },
    {
      name: "Flotte",
      href: "/app/fleet",
      imageSrc: fleetScreenshot,
      description:
        "Verwalte deine Schiffe und erhalte eine Übersicht über unsere Org-Flotte",
      featured: true,
      redacted: !shipManage || !orgFleetRead,
    },
    {
      name: "Karriere",
      href: "/app/career",
      imageSrc: careerScreenshot,
      description:
        "Org-interner Karrierebaum in unseren Bereichen Security und Economics",
      featured: true,
      redacted:
        !careerReadSecurity &&
        !careerReadEconomic &&
        !careerReadManagement &&
        !careerReadTeam,
    },
    {
      name: "SILC",
      href: "/app/silc",
      imageSrc: silcScreenshot,
      description: "Übersicht und Verwaltung von SILC",
      featured: true,
      redacted: !silcBalanceOfOtherCitizenRead,
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
      redacted: !citizenRead && !organizationRead,
    },
    {
      name: "Strafpunkte",
      href: "/app/penalty-points",
      imageSrc: penaltyPointsScreenshot,
      description: "Übersicht und Verwaltung von Strafpunkten",
      featured: true,
      redacted: !penaltyEntryRead,
    },
    {
      name: "Tasks",
      href: "/app/tasks",
      imageSrc: tasksScreenshot,
      description: "Org-internes Quest System",
      featured: true,
      redacted: !taskRead,
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
      href: "/app/dogfight-trainer",
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
      redacted: !logAnalyzerRead,
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
      redacted: !roleManage && !userRead,
    },
  ];

  const featured = apps
    .filter((app) => app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  const other = apps
    .filter((app) => !app.featured)
    .toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    featured,
    other,
  };
};
