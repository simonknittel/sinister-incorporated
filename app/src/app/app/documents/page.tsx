import { requireAuthenticationPage } from "@/auth/server";
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
import srcMarketeer from "@/documents/assets/marketeer.svg";
import srcMember from "@/documents/assets/member.svg";
import srcMining from "@/documents/assets/mining.svg";
import srcMissiles from "@/documents/assets/missiles.svg";
import srcOnboarding from "@/documents/assets/onboarding.svg";
import srcPolaris from "@/documents/assets/polaris.svg";
import srcRecon from "@/documents/assets/recon.svg";
import srcSalvage from "@/documents/assets/salvage.svg";
import srcScavenger from "@/documents/assets/scavenger.svg";
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}7gZRw8y93aE3Nky`,
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}XwpDeR2dyyKA8Sm`,
      },
      {
        name: "Member",
        src: srcMember,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}o5Cydra6B7rtgRK`,
      },
    ],
  },

  {
    name: "Abilities",
    documents: [
      {
        name: "Recon",
        src: srcRecon,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}Y9cY4dJ5AyJqKty`,
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}wxDGfB7LKHG52Q4`,
      },
      {
        name: "Engineering",
        src: srcEngineering,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/engineering.pdf`,
      },
      {
        name: "Boots On The Ground",
        src: srcBootsOnTheGround,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}JgP6Aj8Qgyfg8QH`,
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}xCH6dpcisQGqrgq`,
      },
    ],
  },

  {
    name: "Lead",
    documents: [
      {
        name: "Leadership",
        src: srcLeadership,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}LCwBaiFBdj3B6fz`,
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}jBWF7DYkL9xMHpF`,
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
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}fRXkXeyfSoY5Xws`,
      },
      {
        name: "Trade & Transport",
        src: srcTradeAndTransport,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}EXpqq82JoKTpW2a`,
      },
      {
        name: "Scavenger",
        src: srcScavenger,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL_2}gCaqeqtSjsHxtDx`,
      },
      {
        name: "Marketeer",
        src: srcMarketeer,
        href: `${env.NEXT_PUBLIC_DOWNLOADS_BASE_URL}/marketeer.pdf`,
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
  const authentication = await requireAuthenticationPage("/app/documents");

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
    authentication.authorize("documentScavenger", "read"),
    authentication.authorize("documentMarketeer", "read"),
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
    <main className="p-4 pb-20 lg:p-6 max-w-[1920px] mx-auto">
      <div className="flex justify-center">
        <Hero text="Dokumente" withGlitch size="md" />
      </div>

      <div className="flex flex-col gap-4 mt-4 lg:mt-6">
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
