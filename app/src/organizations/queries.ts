import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { withTrace } from "@/tracing/utils/withTrace";
import type { Organization } from "@prisma/client";
import { cache } from "react";

export const getOrganizationById = cache(
  withTrace("getOrganizationById", async (id: Organization["id"]) => {
    const authentication = await requireAuthentication();
    if (!(await authentication.authorize("organization", "read")))
      throw new Error("Forbidden");

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
  }),
);

export const getOrganizationBySpectrumId = withTrace(
  "getOrganizationBySpectrumId",
  async (spectrumId: Organization["spectrumId"]) => {
    return prisma.organization.findFirst({
      where: {
        spectrumId,
      },
    });
  },
);
