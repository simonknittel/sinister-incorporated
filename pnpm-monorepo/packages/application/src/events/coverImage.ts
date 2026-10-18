import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { EventErrorMessage } from "./eventErrors.js";

/**
 * The cover was uploaded by the form before submitting; it must be the
 * submitter's own image so nobody can attach someone else's upload.
 *
 * @throws ValidationError when the upload is not an own image
 */
export const requireOwnCoverImage = async (
  context: ApplicationContext,
  citizenId: string,
  coverImageId: string,
) => {
  const coverImage = await context.prisma.upload.findUnique({
    where: { id: coverImageId },
    select: { createdById: true, mimeType: true },
  });
  const isOwnImageUpload =
    coverImage !== null &&
    coverImage.createdById === citizenId &&
    coverImage.mimeType.startsWith("image/");
  if (!isOwnImageUpload)
    throw new ValidationError(EventErrorMessage.InvalidCoverImage);
};
