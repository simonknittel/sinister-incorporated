/**
 * The displayed size (after the EXIF orientation). A value is absent when the
 * decoder does not give it.
 */
export interface ImageDimensions {
  readonly width?: number;
  readonly height?: number;
}

/**
 * The probe reads this many bytes first. PNG, JPEG and AVIF usually keep
 * their dimensions in the first bytes of the file. The decoder cannot read
 * WebP, GIF, TIFF, an AVIF with EXIF data or a JPEG with large metadata
 * segments (EXIF, ICC, XMP) from a part of the file. For these, the probe
 * reads the full object.
 */
export const FIRST_IMAGE_BYTES_LENGTH = 64 * 1024;

/**
 * Reads the dimensions from the first bytes. When the decoder cannot read
 * them from the first bytes, it reads them from all bytes. Without
 * `readAllBytes`, the first bytes are the whole image.
 */
export interface ImageReader {
  readonly readDimensions: (
    firstBytes: Uint8Array,
    readAllBytes?: () => Promise<Uint8Array | null>,
  ) => Promise<ImageDimensions | null>;
}
