import { prisma } from "@/db";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import { IamSettingKey } from "@sam-monorepo/database/client";
import { cache } from "react";
import { humanResourcesRoleIdsSchema } from "../utils/humanResourcesRoles";

/**
 * The ids of the roles that count as Human Resources, in the stored order.
 * Ids of roles that were deleted since stay in the setting and are dropped
 * here. No permission check: the clearance page calls it for a user without
 * permissions.
 */
export const getHumanResourcesRoleIds = cache(
  withTrace("getHumanResourcesRoleIds", async (): Promise<string[]> => {
    const setting = await prisma.iamSetting.findUnique({
      where: { key: IamSettingKey.HUMAN_RESOURCES_ROLE_IDS },
    });
    const parsed = humanResourcesRoleIdsSchema.safeParse(setting?.value);
    if (!parsed.success || parsed.data.length === 0) return [];

    const existingRoles = await prisma.role.findMany({
      where: { id: { in: parsed.data } },
      select: { id: true },
    });
    const existingRoleIds = new Set(existingRoles.map((role) => role.id));

    return parsed.data.filter((roleId) => existingRoleIds.has(roleId));
  }),
);
