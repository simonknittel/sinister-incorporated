import type { Prisma } from "@sam-monorepo/database/client";
import type { ActorCitizen } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ForbiddenError, ValidationError } from "../errors.js";
import { UploadErrorMessage } from "./uploadErrors.js";

const ASSIGNABLE_UPLOAD_SELECT = {
  id: true,
  createdById: true,
  mimeType: true,
} satisfies Prisma.UploadSelect;

/** The upload, or null for no id (the input removes the image) */
export const findAssignableUpload = (
  context: Pick<ApplicationContext, "prisma">,
  uploadId: string | null,
) =>
  uploadId
    ? context.prisma.upload.findUnique({
        where: { id: uploadId },
        select: ASSIGNABLE_UPLOAD_SELECT,
      })
    : Promise.resolve(null);

/** Whether the stored MIME type is the type of an image */
export const isImageUpload = (upload: { readonly mimeType: string }) =>
  upload.mimeType.startsWith("image/");

/**
 * The icon and the cover image take only an image that the citizen of the
 * actor uploaded
 *
 * @throws ForbiddenError `UploadErrorMessage.NotOwnUpload`
 * @throws ValidationError `UploadErrorMessage.NotAnImage`
 */
export const requireOwnImageUpload = (
  upload: { readonly createdById: string | null; readonly mimeType: string },
  citizen: ActorCitizen,
) => {
  if (upload.createdById !== citizen.id)
    throw new ForbiddenError(UploadErrorMessage.NotOwnUpload);

  if (!isImageUpload(upload))
    throw new ValidationError(UploadErrorMessage.NotAnImage);
};
