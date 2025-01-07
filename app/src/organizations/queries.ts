import { prisma } from "@/db";
import type { Organization } from "@prisma/client";
import { cache } from "react";

export const getOrganizationById = cache(async (id: Organization["id"]) => {
  return prisma.organization.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      spectrumId: true,
      name: true,
      logo: true,
    },
  });
});

export const getOrganizationBySpectrumId = async (
  spectrumId: Organization["spectrumId"],
) => {
  return prisma.organization.findFirst({
    where: {
      spectrumId,
    },
  });
};
