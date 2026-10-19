import type {
  ApplicationContext,
  ImageDimensions,
} from "@sam-monorepo/application";

/**
 * Browsers apply the EXIF orientation when displaying
 * (`image-orientation: from-image`), so the persisted dimensions must be the
 * displayed ones (`autoOrient`), not the stored ones.
 */
const readDisplayedDimensions = async (
  bytes: Uint8Array,
): Promise<ImageDimensions> => {
  /** Loaded on demand: only the image probe needs the large module */
  const { default: sharp } = await import("sharp");

  const metadata = await sharp(bytes).metadata();
  return metadata.autoOrient;
};

/**
 * Reads the displayed dimensions from the first bytes of an image. If sharp
 * can't read them from this part, it reads them from all bytes. Without
 * `readAllBytes`, the first bytes must be the full image.
 */
export const readImageDimensions = async (
  firstBytes: Uint8Array,
  readAllBytes?: () => Promise<Uint8Array | null>,
): Promise<ImageDimensions | null> => {
  if (!readAllBytes) return readDisplayedDimensions(firstBytes);

  try {
    return await readDisplayedDimensions(firstBytes);
  } catch {
    const allBytes = await readAllBytes();
    if (!allBytes) return null;
    return readDisplayedDimensions(allBytes);
  }
};

/** The image reader of the application context, with sharp */
export const sharpImageReader: NonNullable<ApplicationContext["images"]> = {
  readDimensions: readImageDimensions,
};
