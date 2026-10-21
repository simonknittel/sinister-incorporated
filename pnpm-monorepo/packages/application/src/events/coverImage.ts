import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import {
  findAssignableUpload,
  isOwnImageUpload,
} from "../uploads/assignableUpload.js";
import { EventErrorMessage } from "./eventErrors.js";

/**
 * The form uploads the cover image before the submit. The cover image must
 * be an own image (`isOwnImageUpload()`).
 *
 * @throws ValidationError when the upload is not an own image
 */
export const requireOwnCoverImage = async (
  context: ApplicationContext,
  citizenId: string,
  coverImageId: string,
) => {
  const coverImage = await findAssignableUpload(context, coverImageId);
  if (!coverImage || !isOwnImageUpload(coverImage, citizenId))
    throw new ValidationError(EventErrorMessage.InvalidCoverImage);
};
