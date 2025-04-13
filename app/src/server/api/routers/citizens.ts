import { prisma } from "@/db";
import { log } from "@/logging";
import { getVisibleRoles } from "@/roles/utils/getRoles";
import type { Entity, Role, Upload } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { serializeError } from "serialize-error";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const citizensRouter = createTRPCRouter({
  getAllCitizens: protectedProcedure.query(async () => {
    try {
      const citizens = await prisma.entity.findMany({
        where: {
          handle: {
            not: null,
          },
        },
        orderBy: {
          handle: "asc",
        },
      });

      return citizens;
    } catch (error) {
      void log.error("Failed to fetch citizens", {
        error: serializeError(error),
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch citizens",
      });
    }
  }),

  getCitizensGroupedByVisibleRoles: protectedProcedure.query(async () => {
    try {
      const citizens = await prisma.entity.findMany({
        where: {
          roles: {
            not: null,
          },
        },
        orderBy: {
          handle: "asc",
        },
      });

      const visibleRoles = await getVisibleRoles();

      const groupedCitizens = new Map<
        string,
        {
          role: Role & {
            icon: Upload | null;
          };
          citizens: Entity[];
        }
      >();

      for (const citizen of citizens) {
        const citizenRoleIds = citizen.roles?.split(",") ?? [];
        for (const citizenRoleId of citizenRoleIds) {
          const role = visibleRoles.find((r) => r.id === citizenRoleId);

          if (role) {
            if (!groupedCitizens.has(role.id)) {
              groupedCitizens.set(role.id, { role, citizens: [] });
            }

            groupedCitizens.get(role.id)?.citizens.push(citizen);
          }
        }
      }

      return groupedCitizens;
    } catch (error) {
      void log.error("Failed to fetch citizens", {
        error: serializeError(error),
      });

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch citizens",
      });
    }
  }),
});
