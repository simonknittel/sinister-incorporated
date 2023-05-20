// @ts-check

const { PrismaClient } = require("@prisma/client");
const algoliasearch = require("algoliasearch");

const prisma = new PrismaClient({ log: ["query", "error", "warn"] });

const client = algoliasearch(
  "",
  ""
);

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
                  value: "true",
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
      spectrumId: entity.logs.find((log) => log.type === "spectrum-id")
        .content,
      handles: entity.logs
        .filter((log) => log.type === "handle")
        .map((log) => log.content),
    };
  });

  index.saveObjects(objects);
}

void main();
