import type { MetadataRoute } from "next";
import screenshotDashboardSrc from "../../../docs/screenshot-dashboard.png";
import screenshotSpynetCitizenSrc from "../../../docs/screenshot-spynet-citizen.png";
import faviconSrc from "../assets/favicon.svg";
import { env } from "../env.mjs";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "S.A.M. - Sinister Incorporated",
    short_name: "S.A.M.",
    description:
      "Sinister Administration Module (S.A.M.) of the Star Citizen organization Sinister Incorporated",
    categories: ["entertainment", "games"], // https://github.com/w3c/manifest/wiki/Categories
    scope: env.BASE_URL, // Will open links outside the app in the browser
    start_url: `${env.BASE_URL}/app`,
    shortcuts: [
      // Can't be individualized based on permissions
      {
        name: "Dashboard",
        url: "/app",
      },
      {
        name: "Spynet",
        url: "/spynet",
      },
      {
        name: "Flotte",
        url: "/fleet",
      },
    ],
    display: "standalone",
    background_color: "#000",
    theme_color: "#000",
    icons: [
      {
        src: faviconSrc.src,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
    screenshots: [
      {
        form_factor: "wide",
        src: screenshotDashboardSrc.src,
        sizes: "1280x709",
        type: "image/png",
      },
      {
        form_factor: "wide",
        src: screenshotSpynetCitizenSrc.src,
        sizes: "1280x709",
        type: "image/png",
      },
    ],
  };
}
