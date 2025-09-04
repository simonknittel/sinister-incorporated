import siloAnfrageScreenshot from "@/assets/silo-anfrage-screenshot.png";
import { authenticate } from "@/auth/server";
import { transformPermissionStringToPermissionSet } from "@/auth/transformPermissionStringToPermissionSet";
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
import { withTrace } from "@/tracing/utils/withTrace";
import { cache } from "react";
import type { App } from "./types";

const APPS: App[] = [
  {
    id: "dashboard",
    name: "Dashboard",
    href: "/app",
    imageSrc: dashboardScreenshot,
    description: "Übersicht mit aktuellen Informationen",
    featured: true,
  },
  {
    id: "documents",
    name: "Dokumente",
    href: "/app/documents",
    imageSrc: documentsScreenshot,
    description: "Alles was du zu deinem nächsten Zertifikat wissen möchtest",
    featured: true,
  },
  {
    id: "events",
    name: "Events",
    href: "/app/events",
    imageSrc: eventsScreenshot,
    description: "Übersicht aller anstehenden und vergangenen Events",
    featured: true,
    permissionStrings: ["event;read"],
  },
  {
    id: "fleet",
    name: "Flotte",
    href: "/app/fleet",
    imageSrc: fleetScreenshot,
    description:
      "Verwalte deine Schiffe und erhalte eine Übersicht über unsere Org-Flotte",
    featured: true,
    permissionStrings: ["ship;manage", "orgFleet;read"],
  },
  {
    id: "career",
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
    id: "silc",
    name: "SILC",
    href: "/app/silc",
    imageSrc: silcScreenshot,
    description: "Übersicht und Verwaltung von SILC",
    featured: true,
    permissionStrings: ["silcBalanceOfOtherCitizen;read"],
  },
  {
    // TODO: Move to database
    id: "silo-request",
    name: "SILO-Anfrage",
    href: "/app/silo-request",
    imageSrc: siloAnfrageScreenshot,
    description:
      "Hier kannst du Materialeinträge anmelden, aktuelle Angebote und Preislisten anfordern.",
    featured: true,
  },
  {
    id: "spynet",
    name: "Spynet",
    href: "/app/spynet",
    imageSrc: spynetScreenshot,
    description: "Übersicht und Verwaltung von Citizen und Organisations",
    featured: true,
    permissionStrings: ["citizen;read", "organization;read"],
  },
  {
    id: "penalty-points",
    name: "Strafpunkte",
    href: "/app/penalty-points",
    imageSrc: penaltyPointsScreenshot,
    description: "Übersicht und Verwaltung von Strafpunkten",
    featured: true,
    permissionStrings: ["penaltyEntry;create"],
  },
  {
    id: "tasks",
    name: "Tasks",
    href: "/app/tasks",
    imageSrc: tasksScreenshot,
    description: "Org-internes Quest System",
    featured: true,
    permissionStrings: ["task;read"],
  },
  {
    id: "cornerstone-image-browser",
    name: "Cornerstone Image Browser",
    href: "/app/tools/cornerstone-image-browser",
    imageSrc: cornerstoneImageBrowserScreenshot,
    description:
      "Stellt die Bilder von Cornerstone nebeneinander dar, um sie visuell einfach vergleichen zu können.",
  },
  {
    id: "dogfight-trainer",
    name: "Dogfight Trainer",
    href: "/app/dogfight-trainer",
    imageSrc: dogfightTrainerScreenshot,
    description:
      "Zeige deinen Dogfight Skill in unserer Hommage an den Klassiker, Asteroids. Achte darauf was du abschießt!",
  },
  {
    id: "log-analyzer",
    name: "Log Analyzer",
    href: "/app/tools/log-analyzer",
    imageSrc: logAnalyzerScreenshot,
    description:
      "Wertet die Game Logs von Star Citizen aus um nach Kills zu filtern.",
    permissionStrings: ["logAnalyzer;read"],
  },
  {
    id: "changelog",
    name: "Changelog",
    href: "/app/changelog",
    imageSrc: changelogScreenshot,
    description: "Übersicht der letzten Änderungen im S.A.M.",
  },
  {
    id: "iam",
    name: "IAM",
    href: "/app/iam",
    imageSrc: iamScreenshot,
    description: "Übersicht und Verwaltung der Rollen und Benutzer.",
    permissionStrings: ["role;manage", "user;read"],
  },
];

/**
 * Retrieves all apps from static configuration and database. Then marks apps
 * as redacted when the user lacks the permissions to access them.
 */
export const getApps = cache(
  withTrace("getApps", async () => {
    const authentication = await authenticate();
    if (!authentication) return null;

    // TODO: Implement fetching apps from database

    const apps = await Promise.all(
      APPS.map(async (app) => {
        let redacted = false;

        if (app.permissionStrings && app.permissionStrings.length > 0) {
          const permissions = await Promise.all(
            app.permissionStrings.map(async (permissionString) => {
              const permissionSet =
                transformPermissionStringToPermissionSet(permissionString);

              return authentication.authorize(
                permissionSet.resource,
                permissionSet.operation,
                permissionSet.attributes,
              );
            }),
          );

          if (!permissions.some((permission) => permission === true))
            redacted = true;
        }

        return {
          ...app,
          redacted,
        };
      }),
    );

    return apps;
  }),
);
