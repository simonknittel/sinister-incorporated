import { Link } from "@/common/components/Link";
import { env } from "@/env";
import { TaskRewardType, TaskVisibility } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import { getRoles } from "../queries";
import { PermissionCheckbox } from "./PermissionCheckbox";
import { PermissionsProvider } from "./PermissionsContext";

export const PERMISSIONS = [
  {
    title: "Documents - Onboarding",
    string: "documentOnboarding;read",
  },
  {
    title: "Documents - Alliance Manifest",
    string: "documentAlliance;read",
  },
  {
    title: "Documents - A1",
    string: "documentA1;read",
  },
  {
    title: "Documents - A2",
    string: "documentA2;read",
  },
  {
    title: "Documents - A3",
    string: "documentA3;read",
  },
  {
    title: "Documents - Member",
    string: "documentMember;read",
  },
  {
    title: "Documents - Recon",
    string: "documentRecon;read",
  },
  {
    title: "Documents - Dogfight",
    string: "documentDogfight;read",
  },
  {
    title: "Documents - Advanced Dogfight",
    string: "documentAdvancedDogfight;read",
  },
  {
    title: "Documents - Hands on Deck",
    string: "documentHandsOnDeck;read",
  },
  {
    title: "Documents - Engineering",
    string: "documentEngineering;read",
  },
  {
    title: "Documents - Boots on the Ground",
    string: "documentBootsOnTheGround;read",
  },
  {
    title: "Documents - Captain on the Bridge",
    string: "documentCaptainOnTheBridge;read",
  },
  {
    title: "Documents - Missiles",
    string: "documentMissiles;read",
  },
  {
    title: "Documents - Bombardment",
    string: "documentBombardment;read",
  },
  {
    title: "Documents - Interdict & Disable",
    string: "documentInterdictAndDisable;read",
  },
  {
    title: "Documents - Leadership",
    string: "documentLeadership;read",
  },
  {
    title: "Documents - Tech & Tactic",
    string: "documentTechAndTactic;read",
  },
  {
    title: "Documents - Frontline",
    string: "documentFrontline;read",
  },
  {
    title: "Documents - Lead the Pack",
    string: "documentLeadThePack;read",
  },
  {
    title: "Documents - Supervisor",
    string: "documentSupervisor;read",
  },
  {
    title: "Documents - Manager",
    string: "documentManager;read",
  },
  {
    title: "Documents - Salvage",
    string: "documentSalvage;read",
  },
  {
    title: "Documents - Mining",
    string: "documentMining;read",
  },
  {
    title: "Documents - Trade & Transport",
    string: "documentTradeAndTransport;read",
  },
  {
    title: "Documents - Scavenger",
    string: "documentScavenger;read",
  },
  {
    title: "Documents - Black Marketeer",
    string: "documentMarketeer;read",
  },
  {
    title: "Documents - Polaris",
    string: "documentPolaris;read",
  },
  {
    title: "Tools - Log Analyzer",
    string: "logAnalyzer;read",
  },
  {
    title: "Tasks - Lesen - Öffentliche, personalisierte oder Gruppe",
    string: "task;read",
  },
  {
    title: "Tasks - Lesen - Gelöschte",
    string: "task;read;taskDeleted=1",
  },
  {
    title: "Tasks - Erstellen - Öffentlich",
    string: "task;create",
  },
  {
    title: "Tasks - Erstellen - Personalisiert oder Gruppe",
    string: `task;create;taskVisibility=${TaskVisibility.PERSONALIZED}`,
  },
  {
    title: "Tasks - Erstellen - Mit neuen SILC",
    string: `task;create;taskVisibility=${TaskVisibility.PERSONALIZED};taskRewardType=${TaskRewardType.NEW_SILC}`,
  },
  {
    title: "Tasks - Verwalten",
    string: "task;manage",
  },
] as const;

const gridTemplateColumns = `256px repeat(${PERMISSIONS.length}, 32px)`;

interface Props {
  readonly className?: string;
}

export const PermissionMatrix = async ({ className }: Props) => {
  const roles = await getRoles(true);

  return (
    <section
      className={clsx(
        "p-4 lg:p-8 rounded-primary background-secondary overflow-x-scroll",
        className,
      )}
    >
      <table>
        <thead>
          <tr
            className="grid gap-2 text-left text-neutral-500 -mx-2 text-sm h-64"
            style={{
              gridTemplateColumns,
            }}
          >
            <th className="font-normal whitespace-nowrap flex justify-center items-end">
              <div className="-rotate-45 w-0">
                <span>Rolle</span>
              </div>
            </th>

            {PERMISSIONS.map((permission) => (
              <th
                key={permission.string}
                className="font-normal whitespace-nowrap flex justify-center items-end"
              >
                <div className="-rotate-45 w-0">
                  <span>{permission.title}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="flex flex-col gap-2">
          {roles.map((role) => (
            <tr
              key={role.id}
              className="grid items-center gap-2 -mx-2"
              style={{
                gridTemplateColumns,
              }}
            >
              <td className="h-8 overflow-hidden sticky -left-2 z-10 background-secondary rounded-secondary">
                <Link
                  href={`/app/roles/${role.id}`}
                  className="flex items-center gap-2 hover:bg-neutral-800 px-2 rounded h-full"
                  prefetch={false}
                >
                  {role.icon ? (
                    <div className="aspect-square size-4 flex items-center justify-center rounded overflow-hidden flex-none">
                      <Image
                        src={`https://${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${role.icon.id}`}
                        alt=""
                        width={16}
                        height={16}
                        className="max-w-full max-h-full"
                        unoptimized={["image/svg+xml", "image/gif"].includes(
                          role.icon.mimeType,
                        )}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="size-4 flex-none" />
                  )}

                  <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                    {role.name}
                  </p>
                </Link>
              </td>

              <PermissionsProvider role={role}>
                {PERMISSIONS.map((permission) => (
                  <PermissionCheckbox
                    key={permission.string}
                    role={role}
                    permission={permission}
                  />
                ))}
              </PermissionsProvider>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};
