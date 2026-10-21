import { FlowRoleAccessType } from "@sam-monorepo/database/client";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { idSchema } from "../pagination.js";
import { withSpan } from "../withSpan.js";
import { CareerErrorMessage } from "./careerErrors.js";

/** The limit of each tier against a crafted payload */
const MAXIMUM_FLOW_ACCESS_ROLES = 250;

const roleIdsSchema = z.array(idSchema).max(MAXIMUM_FLOW_ACCESS_ROLES);

export const updateFlowRoleAccessInputSchema = z.object({
  flow_id: idSchema,
  /** The roles that can read the flow */
  read_role_ids: roleIdsSchema,
  /** The roles that can read and edit the flow */
  update_role_ids: roleIdsSchema,
});

export type UpdateFlowRoleAccessInput = z.infer<
  typeof updateFlowRoleAccessInputSchema
>;

export interface UpdateFlowRoleAccessOutput {
  readonly flow_id: string;
  /** Without the roles that have the edit tier */
  readonly read_role_ids: readonly string[];
  readonly update_role_ids: readonly string[];
}

/**
 * Replaces the role access of a live flow. Requires `career;manage`.
 *
 * @throws NotFoundError when the flow does not exist or is deleted
 * @throws ValidationError when a role does not exist
 */
export const updateFlowRoleAccess = (
  context: ApplicationContext,
  actor: Actor,
  input: UpdateFlowRoleAccessInput,
): Promise<UpdateFlowRoleAccessOutput> =>
  withSpan(context, "updateFlowRoleAccess", async () => {
    requirePermission(actor, "career", "manage");

    const flow = await context.prisma.flow.findUnique({
      where: { id: input.flow_id },
      select: { id: true, deletedAt: true },
    });
    if (!flow || flow.deletedAt)
      throw new NotFoundError(CareerErrorMessage.FlowNotFound);

    /**
     * UPDATE includes READ, thus a role in both tiers gets exactly one row
     * with the higher tier
     */
    const updateRoleIds = [...new Set(input.update_role_ids)];
    const readRoleIds = [
      ...new Set(
        input.read_role_ids.filter((roleId) => !updateRoleIds.includes(roleId)),
      ),
    ];

    const roleIds = [...readRoleIds, ...updateRoleIds];
    const existingRoles = await context.prisma.role.count({
      where: { id: { in: roleIds } },
    });
    if (existingRoles !== roleIds.length)
      throw new ValidationError(CareerErrorMessage.UnknownRole);

    await context.prisma.$transaction([
      context.prisma.flowRoleAccess.deleteMany({ where: { flowId: flow.id } }),

      context.prisma.flowRoleAccess.createMany({
        data: [
          ...readRoleIds.map((roleId) => ({
            flowId: flow.id,
            roleId,
            type: FlowRoleAccessType.READ,
          })),
          ...updateRoleIds.map((roleId) => ({
            flowId: flow.id,
            roleId,
            type: FlowRoleAccessType.UPDATE,
          })),
        ],
      }),

      context.prisma.flow.update({
        where: { id: flow.id },
        data: { updatedById: actor.citizen?.id ?? null },
      }),
    ]);

    await context.audit.create([
      {
        type: AuditEventType.CAREER_FLOW_ROLE_ACCESS_UPDATED,
        data: { flowId: flow.id, readRoleIds, updateRoleIds },
        createdById: actor.userId,
      },
    ]);

    return {
      flow_id: flow.id,
      read_role_ids: readRoleIds,
      update_role_ids: updateRoleIds,
    };
  });
