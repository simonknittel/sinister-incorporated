"use server";

import { prisma } from "@/db";
import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import { rejectConflict } from "@/modules/actions/utils/rejectConflict";
import { AuditEventType } from "@/modules/audit/utils/AuditEventTypes";
import { createAuditEvents } from "@/modules/audit/utils/createAuditEvent";
import { IamSettingKey } from "@sam-monorepo/database/client";
import { refresh } from "next/cache";
import * as z from "zod";
import { humanResourcesRoleIdsSchema } from "../utils/humanResourcesRoles";

const schema = z.object({
  /** One `roleId` form field per role */
  roleIds: humanResourcesRoleIdsSchema.transform((values) => [
    ...new Set(values),
  ]),
});

/** Replaces the whole list of the roles that count as Human Resources */
export const updateHumanResourcesRoles = createAuthenticatedAction(
  "updateHumanResourcesRoles",
  schema,
  async (formData, authentication, data, t) => {
    if (!(await authentication.authorize("role", "manage")))
      return { error: t("Common.forbidden"), requestPayload: formData };

    const existingRoleCount = await prisma.role.count({
      where: { id: { in: data.roleIds } },
    });
    if (existingRoleCount !== data.roleIds.length) {
      /**
       * A different user or tab deleted a selected role before, and the
       * options must show it
       */
      return rejectConflict(t("Common.badRequest"), formData);
    }

    const updatedById = authentication.session.entity?.id ?? null;
    await prisma.iamSetting.upsert({
      where: { key: IamSettingKey.HUMAN_RESOURCES_ROLE_IDS },
      update: { value: data.roleIds, updatedById },
      create: {
        key: IamSettingKey.HUMAN_RESOURCES_ROLE_IDS,
        value: data.roleIds,
        updatedById,
      },
    });

    refresh();

    await createAuditEvents([
      {
        type: AuditEventType.IAM_SETTING_UPDATED,
        data: {
          key: IamSettingKey.HUMAN_RESOURCES_ROLE_IDS,
          value: JSON.stringify(data.roleIds),
        },
        createdById: authentication.session.user.id,
      },
    ]);

    return { success: t("Common.successfullySaved") };
  },
  {
    parseFormData: (formData) => ({ roleIds: formData.getAll("roleId") }),
  },
);
