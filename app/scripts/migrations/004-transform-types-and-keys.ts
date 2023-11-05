/**
 * Usage:
 * ```bashrc
 * npm install --global ts-node
 *
 * ts-node --esm --skipProject ./migrations/004-transform-types-and-keys.ts
 *
 * DATABASE_URL='mysql://************@/:************@aws.connect.psdb.cloud/db?sslaccept=strict' ts-node --esm --skipProject ./migrations/004-transform-types-and-keys.ts
 * ```
 */

import { prisma } from "../prisma";

async function main() {
  await prisma.$transaction([
    prisma.entityLog.updateMany({
      data: {
        type: "discord-id",
      },
      where: {
        type: "discordId",
      },
    }),
    prisma.entityLog.updateMany({
      data: {
        type: "teamspeak-id",
      },
      where: {
        type: "teamspeakId",
      },
    }),
    prisma.entityLog.updateMany({
      data: {
        type: "community-moniker",
      },
      where: {
        type: "communityMoniker",
      },
    }),
    prisma.entityLogAttribute.updateMany({
      data: {
        value: "false-report",
      },
      where: {
        value: "falseReport",
      },
    }),
    prisma.permission.updateMany({
      data: {
        resource: "discord-id",
      },
      where: {
        resource: "discordId",
      },
    }),
    prisma.permission.updateMany({
      data: {
        resource: "teamspeak-id",
      },
      where: {
        resource: "teamspeakId",
      },
    }),
    prisma.permission.updateMany({
      data: {
        resource: "citizen-id",
      },
      where: {
        resource: "citizenId",
      },
    }),
    prisma.permission.updateMany({
      data: {
        resource: "community-moniker",
      },
      where: {
        resource: "communityMoniker",
      },
    }),
  ]);
}

void main().then(() => console.info("Finished."));
