"use server";

import { prisma } from "@/db";
import { log } from "@/logging";
import { serializeError } from "serialize-error";
import { getIndex } from "..";

export const updateIndices = async () => {
  try {
    const [organizations, citizen] = await prisma.$transaction([
      prisma.organization.findMany(),

      prisma.entity.findMany({
        include: {
          logs: {
            where: {
              type: {
                in: ["handle", "community-moniker", "citizen-id"],
              },
              attributes: {
                some: {
                  key: "confirmed",
                  value: "confirmed",
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      }),
    ]);

    const index = getIndex();
    await index.clearObjects();

    await index.saveObjects([
      ...organizations.map((organization) => ({
        objectID: organization.id,
        spectrumId: organization.spectrumId,
        type: "organization",
        names: [organization.name],
      })),

      ...citizen.map((citizen) => ({
        objectID: citizen.id,
        spectrumId: citizen.spectrumId,
        type: "citizen",
        handles: citizen.logs
          .filter((log) => log.type === "handle")
          .map((log) => log.content),
        communityMonikers: citizen.logs
          .filter((log) => log.type === "community-moniker")
          .map((log) => log.content),
        citizenIds: citizen.logs
          .filter((log) => log.type === "citizen-id")
          .map((log) => log.content),
      })),
    ]);

    return {
      success: "Successfully updated Algolia indices",
    };
  } catch (error) {
    await log.error("Failed to update Algolia indices", {
      error: serializeError(error),
    });

    return {
      error: "Failed to update Algolia indices",
    };
  }
};
