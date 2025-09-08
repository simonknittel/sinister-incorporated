import siloAnfrageScreenshot from "@/assets/silo-anfrage-screenshot.png";
import type { ExternalApp } from "./types";

// TODO: Move to database
export const externalApps: ExternalApp[] = [
  {
    id: "cmfavc1fu0000eo9v2ff6bfh2",
    name: "SILO-Anfrage",
    slug: "silo-request",
    imageSrc: siloAnfrageScreenshot,
    description:
      "Hier kannst du Materialeinträge anmelden, aktuelle Angebote und Preislisten anfordern.",
    featured: true,
    defaultPage: {
      iframeUrl:
        "https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform",
    },
    // pages: [
    //   {
    //     title: "Test",
    //     slug: "test",
    //     iframeUrl:
    //       "https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform?embedded=true",
    //   },
    //   {
    //     title: "In einem neuen Tab öffnen",
    //     externalUrl:
    //       "https://docs.google.com/forms/d/e/1FAIpQLSeHEgpv4GmnZhu7MS2aQc9zgETWQw8tusJ7oaGLsyuHeD1LMw/viewform",
    //   },
    // ],
    createLinks: [
      {
        title: "SILO-Anfrage",
        slug: "",
      },
    ],
  },
];
