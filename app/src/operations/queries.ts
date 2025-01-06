import { prisma } from "@/db";
import type { Operation } from "@prisma/client";
import { cache } from "react";

export const getOperation = cache(async (id: Operation["id"]) => {
  return prisma.operation.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      units: {
        include: {
          members: {
            include: {
              user: true,
              ship: {
                include: {
                  variant: true,
                },
              },
            },
          },
          childUnits: {
            include: {
              members: {
                include: {
                  user: true,
                  ship: {
                    include: {
                      variant: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
});
