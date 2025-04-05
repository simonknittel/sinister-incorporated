import { authenticatePage } from "@/auth/server";
import { Hero } from "@/common/components/Hero";
import { Link } from "@/common/components/Link";
import { Tile } from "@/common/components/Tile";
import srcA1 from "@/documents/assets/a1.svg";
import srcA2 from "@/documents/assets/a2.svg";
import srcA3 from "@/documents/assets/a3.svg";
import srcAdvancedDogfight from "@/documents/assets/advancedDogfight.svg";
import srcAlliance from "@/documents/assets/alliance.svg";
import srcBombardment from "@/documents/assets/bombardment.svg";
import srcBootsOnTheGround from "@/documents/assets/bootsOnTheGround.svg";
import srcCaptainOnTheBridge from "@/documents/assets/captainOnTheBridge.svg";
import srcDogfight from "@/documents/assets/dogfight.svg";
import srcEngineering from "@/documents/assets/engineering.svg";
import srcFrontline from "@/documents/assets/frontline.svg";
import srcHandsOnDeck from "@/documents/assets/handsOnDeck.svg";
import srcInterdictAndDisable from "@/documents/assets/interdictAndDisable.svg";
import srcLeadership from "@/documents/assets/leadership.svg";
import srcLeadThePack from "@/documents/assets/leadThePack.svg";
import srcManager from "@/documents/assets/manager.svg";
import srcMember from "@/documents/assets/member.svg";
import srcMining from "@/documents/assets/mining.svg";
import srcMissiles from "@/documents/assets/missiles.svg";
import srcOnboarding from "@/documents/assets/onboarding.svg";
import srcPolaris from "@/documents/assets/polaris.svg";
import srcRecon from "@/documents/assets/recon.svg";
import srcSalvage from "@/documents/assets/salvage.svg";
import srcSupervisor from "@/documents/assets/supervisor.svg";
import srcTechAndTactic from "@/documents/assets/techAndTactic.svg";
import srcTradeAndTransport from "@/documents/assets/tradeAndTransport.svg";
import { env } from "@/env";
import { type Metadata } from "next";
import Image from "next/image";
import { forbidden } from "next/navigation";

const categories = [
  {
    name: "Basics",
    documents: [
      {
        name: "Alliance",
        src: srcAlliance,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/alliance.pdf`,
      },
      {
        name: "Onboarding",
        src: srcOnboarding,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/onboarding.pdf`,
      },
      {
        name: "A1",
        src: srcA1,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/a1.pdf`,
      },
      {
        name: "A2",
        src: srcA2,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/a2.pdf`,
      },
      {
        name: "A3",
        src: srcA3,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/a3.pdf`,
      },
      {
        name: "Member",
        src: srcMember,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/member.pdf`,
      },
    ],
  },

  {
    name: "Abilities",
    documents: [
      {
        name: "Recon",
        src: srcRecon,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/recon.pdf`,
      },
      {
        name: "Dogfight",
        src: srcDogfight,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/dogfight.pdf`,
      },
      {
        name: "Advanced Dogfight",
        src: srcAdvancedDogfight,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/advanced-dogfight.pdf`,
      },
      {
        name: "Hands On Deck",
        src: srcHandsOnDeck,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/hands-on-deck.pdf`,
      },
      {
        name: "Engineering",
        src: srcEngineering,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/engineering.pdf`,
      },
      {
        name: "Boots On The Ground",
        src: srcBootsOnTheGround,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/boots-on-the-ground.pdf`,
      },
      {
        name: "Captain On The Bridge",
        src: srcCaptainOnTheBridge,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/captain-on-the-bridge.pdf`,
      },
      {
        name: "Missiles",
        src: srcMissiles,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/missiles.pdf`,
      },
      {
        name: "Bombardment",
        src: srcBombardment,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/bombardment.pdf`,
      },
      {
        name: "Interdict & Disable",
        src: srcInterdictAndDisable,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/interdict&disable.pdf`,
      },
    ],
  },

  {
    name: "Lead",
    documents: [
      {
        name: "Leadership",
        src: srcLeadership,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/leadership.pdf`,
      },
      {
        name: "Tech & Tactic",
        src: srcTechAndTactic,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/tech&tactic.pdf`,
      },
      {
        name: "Frontline",
        src: srcFrontline,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/frontline.pdf`,
      },
      {
        name: "Lead The Pack",
        src: srcLeadThePack,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/lead-the-pack.pdf`,
      },
      {
        name: "Supervisor",
        src: srcSupervisor,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/supervisor.pdf`,
      },
      {
        name: "Manager",
        src: srcManager,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/manager.pdf`,
      },
    ],
  },

  {
    name: "Eco",
    documents: [
      {
        name: "Salvage",
        src: srcSalvage,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/salvage.pdf`,
      },
      {
        name: "Mining",
        src: srcMining,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/mining.pdf`,
      },
      {
        name: "Trade & Transport",
        src: srcTradeAndTransport,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/trade&transport.pdf`,
      },
    ],
  },

  {
    name: "Ship Manuals",
    documents: [
      {
        name: "Polaris",
        src: srcPolaris,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/polaris.pdf`,
      },
    ],
  },
];

export const metadata: Metadata = {
  title: "Dokumente | S.A.M. - Sinister Incorporated",
};

export default async function Page() {
  const authentication = await authenticatePage("/app/documents");

  const authorizations = await Promise.all([
    authentication.authorize("documentAlliance", "read"),
    authentication.authorize("documentOnboarding", "read"),
    authentication.authorize("documentA1", "read"),
    authentication.authorize("documentA2", "read"),
    authentication.authorize("documentA3", "read"),
    authentication.authorize("documentMember", "read"),
    authentication.authorize("documentRecon", "read"),
    authentication.authorize("documentDogfight", "read"),
    authentication.authorize("documentAdvancedDogfight", "read"),
    authentication.authorize("documentHandsOnDeck", "read"),
    authentication.authorize("documentEngineering", "read"),
    authentication.authorize("documentBootsOnTheGround", "read"),
    authentication.authorize("documentCaptainOnTheBridge", "read"),
    authentication.authorize("documentMissiles", "read"),
    authentication.authorize("documentBombardment", "read"),
    authentication.authorize("documentInterdictAndDisable", "read"),
    authentication.authorize("documentLeadership", "read"),
    authentication.authorize("documentTechAndTactic", "read"),
    authentication.authorize("documentFrontline", "read"),
    authentication.authorize("documentLeadThePack", "read"),
    authentication.authorize("documentSupervisor", "read"),
    authentication.authorize("documentManager", "read"),
    authentication.authorize("documentSalvage", "read"),
    authentication.authorize("documentMining", "read"),
    authentication.authorize("documentTradeAndTransport", "read"),
    authentication.authorize("documentPolaris", "read"),
  ]);

  if (authorizations.every((authorization) => !authorization)) forbidden();

  const categoriesWithAuthorizedDocuments = [];
  let counter = 0;
  for (const category of categories) {
    const documents = [];
    for (const document of category.documents) {
      if (authorizations[counter]) documents.push(document);
      counter++;
    }
    if (documents.length > 0)
      categoriesWithAuthorizedDocuments.push({ ...category, documents });
  }

  return (
    <main className="p-4 pb-20 lg:p-8 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Dokumente" withGlitch />
      </div>

      <div className="flex flex-col gap-4 mt-4 lg:mt-8">
        {categoriesWithAuthorizedDocuments.map(({ name, documents }) => (
          <Tile
            key={name}
            heading={name}
            childrenClassName="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-2 p-4 border-t border-neutral-800"
          >
            {documents.map(({ name, src, href }) => (
              <div key={name} className="flex items-center justify-center">
                <Link
                  href={href}
                  className="block"
                  rel="noreferrer"
                  title={name}
                  prefetch={false}
                >
                  <Image
                    src={src}
                    alt=""
                    width={391}
                    height={219}
                    unoptimized
                    loading="lazy"
                  />
                </Link>
              </div>
            ))}
          </Tile>
        ))}
      </div>
    </main>
  );
}
