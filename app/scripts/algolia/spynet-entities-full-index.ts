/**
 * Usage:
 * ```bashrc
 * npm install --global ts-node
 *
 * ts-node --esm --skipProject ./algolia/spynet-entities-full-index.ts
 *
 * DATABASE_URL='mysql://************@/:************@aws.connect.psdb.cloud/db?sslaccept=strict' ts-node --esm --skipProject ./algolia/spynet-entities-full-index.ts
 * ```
 */

import algoliasearch from "algoliasearch";
import { prisma } from "../prisma";

const client = algoliasearch("", "");

const index = client.initIndex("spynet_entities");

async function main() {
  const entities = await prisma.entity.findMany({
    include: {
      logs: {
        where: {
          OR: [
            {
              type: "handle",
              attributes: {
                some: {
                  key: "confirmed",
                  value: "confirmed",
                },
              },
            },
            {
              type: "spectrum-id",
            },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const objects = entities.map((entity) => {
    return {
      objectID: entity.id,
      type: "citizen",
      spectrumId: entity.logs.find((log) => log.type === "spectrum-id")!
        .content,
      handles: entity.logs
        .filter((log) => log.type === "handle")
        .map((log) => log.content),
    };
  });

  await index.saveObjects(objects);
}

void main();
