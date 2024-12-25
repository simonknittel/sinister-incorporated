import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { VariantStatus } from "@prisma/client";

export const getOrgFleet = async ({
  onlyFlightReady = false,
}: {
  onlyFlightReady?: boolean;
}) => {
  const authentication = await requireAuthentication();
  if (!(await authentication.authorize("orgFleet", "read")))
    throw new Error("Forbidden");

  return prisma.ship.findMany({
    where: {
      variant: {
        status: onlyFlightReady ? VariantStatus.FLIGHT_READY : undefined,
      },
    },
    include: {
      variant: {
        include: {
          series: {
            include: {
              manufacturer: true,
            },
          },
        },
      },
    },
  });
};
