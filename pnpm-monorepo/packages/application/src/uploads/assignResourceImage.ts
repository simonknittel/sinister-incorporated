import type { Prisma } from "@sam-monorepo/database/client";
import { AuditEventType } from "@sam-monorepo/domain";
import * as z from "zod";
import { requireCitizen, requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { rethrowRecordNotFound } from "../errors.js";
import { idSchema } from "../pagination.js";
import { UploadErrorMessage } from "./uploadErrors.js";

/**
 * The image columns of a role. The values are the names of the columns,
 * which the audit event records.
 */
export enum RoleImageAttribute {
  Icon = "iconId",
  Thumbnail = "thumbnailId",
}

export const assignManufacturerImageInputSchema = z.object({
  manufacturer_id: idSchema,
  upload_id: idSchema,
});

export type AssignManufacturerImageInput = z.infer<
  typeof assignManufacturerImageInputSchema
>;

export const assignRoleImageInputSchema = z.object({
  role_id: idSchema,
  attribute: z.enum(RoleImageAttribute),
  upload_id: idSchema,
});

export type AssignRoleImageInput = z.infer<typeof assignRoleImageInputSchema>;

export interface AssignResourceImageOutput {
  /** The image whose dimensions the host probes after the response */
  readonly probe_upload_id: string;
}

const toRoleImageData = (
  attribute: RoleImageAttribute,
  uploadId: string,
): Prisma.RoleUncheckedUpdateInput => {
  switch (attribute) {
    case RoleImageAttribute.Icon:
      return { iconId: uploadId };

    case RoleImageAttribute.Thumbnail:
      return { thumbnailId: uploadId };

    default:
      throw new Error(
        `Unknown role image attribute: ${attribute satisfies never}`,
      );
  }
};

/**
 * Sets the image of a manufacturer. The author of an upload is a citizen,
 * thus the actor needs one.
 *
 * @throws ForbiddenError when the user has no citizen or when the actor does
 * not have `manufacturersSeriesAndVariants;manage`
 * @throws NotFoundError `UploadErrorMessage.TargetNotFound`
 */
export const assignManufacturerImage = async (
  context: ApplicationContext,
  actor: Actor,
  input: AssignManufacturerImageInput,
): Promise<AssignResourceImageOutput> => {
  requireCitizen(actor);
  requirePermission(actor, "manufacturersSeriesAndVariants", "manage");

  await rethrowRecordNotFound(
    () =>
      context.prisma.manufacturer.update({
        where: { id: input.manufacturer_id },
        data: { imageId: input.upload_id },
        select: { id: true },
      }),
    UploadErrorMessage.TargetNotFound,
  );

  await context.audit.create([
    {
      type: AuditEventType.RESOURCE_IMAGE_ASSIGNED,
      data: {
        resourceType: "manufacturer",
        resourceId: input.manufacturer_id,
        resourceAttribute: "imageId",
        imageId: input.upload_id,
      },
      createdById: actor.userId,
    },
  ]);

  return { probe_upload_id: input.upload_id };
};

/**
 * Sets the icon or the thumbnail of a role. The author of an upload is a
 * citizen, thus the actor needs one.
 *
 * @throws ForbiddenError when the user has no citizen or when the actor does
 * not have `role;manage`
 * @throws NotFoundError `UploadErrorMessage.TargetNotFound`
 */
export const assignRoleImage = async (
  context: ApplicationContext,
  actor: Actor,
  input: AssignRoleImageInput,
): Promise<AssignResourceImageOutput> => {
  requireCitizen(actor);
  requirePermission(actor, "role", "manage");

  await rethrowRecordNotFound(
    () =>
      context.prisma.role.update({
        where: { id: input.role_id },
        data: toRoleImageData(input.attribute, input.upload_id),
        select: { id: true },
      }),
    UploadErrorMessage.TargetNotFound,
  );

  await context.audit.create([
    {
      type: AuditEventType.RESOURCE_IMAGE_ASSIGNED,
      data: {
        resourceType: "role",
        resourceId: input.role_id,
        resourceAttribute: input.attribute,
        imageId: input.upload_id,
      },
      createdById: actor.userId,
    },
  ]);

  return { probe_upload_id: input.upload_id };
};
