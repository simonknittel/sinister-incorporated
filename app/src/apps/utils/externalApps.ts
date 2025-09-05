import siloAnfrageScreenshot from "@/assets/silo-anfrage-screenshot.png";
import type { ExternalApp } from "./types";

// TODO: Move to database
export const externalApps: ExternalApp[] = [
  {
    id: "silo-request",
    slug: "silo-request",
    name: "SILO-Anfrage",
    href: "/app/silo-request",
    imageSrc: siloAnfrageScreenshot,
    description:
      "Hier kannst du Materialeinträge anmelden, aktuelle Angebote und Preislisten anfordern.",
    featured: true,
  },
];
