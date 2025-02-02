import { requireAuthentication } from "@/auth/server";
import { prisma } from "@/db";
import { getTracer } from "@/tracing/utils/getTracer";
import { SpanStatusCode } from "@opentelemetry/api";
import type { Entity } from "@prisma/client";
import { cache } from "react";
import { getRoles } from "../queries";

export const getVisibleRoles = cache(async () => {
  return getTracer().startActiveSpan("getVisibleRoles", async (span) => {
    try {
      const authentication = await requireAuthentication();

      const allRoles = await getRoles();
      // TODO: Filter `inherits` as well
      const visibleRoles = (
        await Promise.all(
          allRoles.map(async (role) => {
            return {
              role,
              include: await authentication.authorize("otherRole", "read", [
                {
                  key: "roleId",
                  value: role.id,
                },
              ]),
            };
          }),
        )
      )
        .filter(({ include }) => include)
        .map(({ role }) => role)
        .sort((a, b) => a.name.localeCompare(b.name));

      return visibleRoles;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

export const getAssignedRoles = cache(async (entity: Entity) => {
  const visibleRoles = await getVisibleRoles();

  const assignedRoleIds = entity.roles?.split(",") ?? [];
  const assignedRoles = visibleRoles.filter((role) =>
    assignedRoleIds.includes(role.id),
  );

  return assignedRoles;
});

export const getMyAssignedRoles = cache(async () => {
  return getTracer().startActiveSpan("getMyAssignedRoles", async (span) => {
    try {
      const authentication = await requireAuthentication();

      const entity = await prisma.entity.findUnique({
        where: {
          discordId: authentication.session.discordId,
        },
      });
      if (!entity) throw new Error("Forbidden");

      return await getAssignedRoles(entity);
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});

export const getAssignableRoles = cache(async () => {
  return getTracer().startActiveSpan("getAssignableRoles", async (span) => {
    try {
      const [authentication, allRoles] = await Promise.all([
        requireAuthentication(),
        getVisibleRoles(),
      ]);

      const assignableRoles = (
        await Promise.all(
          allRoles.map(async (role) => {
            const include =
              (await authentication.authorize("otherRole", "assign", [
                {
                  key: "roleId",
                  value: role.id,
                },
              ])) ||
              (await authentication.authorize("otherRole", "dismiss", [
                {
                  key: "roleId",
                  value: role.id,
                },
              ]));

            return {
              role,
              include,
            };
          }),
        )
      )
        .filter(({ include }) => include)
        .map(({ role }) => role)
        .sort((a, b) => a.name.localeCompare(b.name));

      return assignableRoles;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
      });
      throw error;
    } finally {
      span.end();
    }
  });
});
