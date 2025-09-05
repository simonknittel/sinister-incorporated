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
import type { IntegratedApp } from "./types";

export const INTEGRATED_APPS: IntegratedApp[] = [
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
    permissionStrings: ["event;read"],
  },
  {
    name: "Flotte",
    href: "/app/fleet",
    imageSrc: fleetScreenshot,
    description:
      "Verwalte deine Schiffe und erhalte eine Übersicht über unsere Org-Flotte",
    featured: true,
    permissionStrings: ["ship;manage", "orgFleet;read"],
  },
  {
    name: "Karriere",
    href: "/app/career",
    imageSrc: careerScreenshot,
    description:
      "Org-interner Karrierebaum in unseren Bereichen Security und Economics",
    featured: true,
    permissionStrings: [
      "career;read;flowId=security",
      "career;read;flowId=economic",
      "career;read;flowId=management",
      "career;read;flowId=team",
    ],
  },
  {
    name: "SILC",
    href: "/app/silc",
    imageSrc: silcScreenshot,
    description: "Übersicht und Verwaltung von SILC",
    featured: true,
    permissionStrings: ["silcBalanceOfOtherCitizen;read"],
  },
  {
    name: "Spynet",
    href: "/app/spynet",
    imageSrc: spynetScreenshot,
    description: "Übersicht und Verwaltung von Citizen und Organisations",
    featured: true,
    permissionStrings: ["citizen;read", "organization;read"],
  },
  {
    name: "Strafpunkte",
    href: "/app/penalty-points",
    imageSrc: penaltyPointsScreenshot,
    description: "Übersicht und Verwaltung von Strafpunkten",
    featured: true,
    permissionStrings: ["penaltyEntry;create"],
  },
  {
    name: "Tasks",
    href: "/app/tasks",
    imageSrc: tasksScreenshot,
    description: "Org-internes Quest System",
    featured: true,
    permissionStrings: ["task;read"],
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
    permissionStrings: ["logAnalyzer;read"],
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
    permissionStrings: ["role;manage", "user;read"],
  },
];
