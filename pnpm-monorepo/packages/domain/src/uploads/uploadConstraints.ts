/** The two kinds of files that `POST /api/upload` accepts */
export enum UploadCategory {
  Image = "image",
  /** A file that is not an image, for example the attachment of a wiki page */
  Attachment = "attachment",
}

/**
 * The `application/*` MIME types that an attachment can have: PDF, office
 * documents and structured text formats that browsers report with an
 * `application/` type. Plain text formats are not in the list, because
 * `isAttachmentMimeType` accepts most `text/*` types. The list has no
 * archives (a reader cannot examine their contents quickly), no
 * `application/octet-stream` (the type of executables and unknown binaries)
 * and no XML: everyone can read an upload directly from the bucket, and a
 * browser shows an XML document inline, where an SVG or XSLT payload can
 * execute scripts.
 */
export const ATTACHMENT_APPLICATION_MIME_TYPES: readonly string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/rtf",
  "application/json",
  "application/yaml",
  "application/x-yaml",
  "application/toml",
  "application/sql",
];

/**
 * The `text/*` types that browsers show as active documents. Everyone can
 * read an upload directly from the bucket (without the
 * `Content-Disposition: attachment` of the attachment route), thus these
 * types would execute scripts on the origin of the bucket. The upload
 * refuses them.
 */
const SCRIPTABLE_TEXT_MIME_TYPES: readonly string[] = ["text/html", "text/xml"];

/**
 * The type without parameters, in lowercase letters. A comparison of the raw
 * string would let `text/html;charset=utf-8` or `TEXT/HTML` pass the
 * exclusions.
 */
const getMimeTypeEssence = (mimeType: string): string =>
  (mimeType.split(";")[0] ?? "").trim().toLowerCase();

/**
 * Whether a file with this MIME type can be an attachment: most `text/*`
 * types and the `application/*` types of `ATTACHMENT_APPLICATION_MIME_TYPES`,
 * but no type that a browser shows as a document with scripts (see
 * `SCRIPTABLE_TEXT_MIME_TYPES`). A type with parameters is refused, thus the
 * stored `Content-Type` stays one exact token that a comparison can use.
 */
export const isAttachmentMimeType = (mimeType: string): boolean => {
  if (mimeType.includes(";")) return false;
  const essence = getMimeTypeEssence(mimeType);
  if (SCRIPTABLE_TEXT_MIME_TYPES.includes(essence)) return false;
  return (
    essence.startsWith("text/") ||
    ATTACHMENT_APPLICATION_MIME_TYPES.includes(essence)
  );
};

/**
 * Whether a file with this MIME type can be an image upload. SVG is refused:
 * the app shows images inline from the public URL of the bucket, and an SVG
 * document can execute scripts.
 */
export const isAllowedImageMimeType = (mimeType: string): boolean => {
  if (mimeType.includes(";")) return false;
  const essence = getMimeTypeEssence(mimeType);
  if (essence === "image/svg+xml") return false;
  return essence.startsWith("image/");
};

/**
 * The maximum declared size of an attachment. The upload checks the size
 * when it creates the row, and the client checks it before the upload
 * starts. The presigned PUT URL cannot enforce it.
 */
export const MAXIMUM_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * The maximum declared size of an image upload. The checks are the same as
 * for `MAXIMUM_ATTACHMENT_SIZE_BYTES`. The dimension probe of the server
 * also uses it as its limit: the declared size is only a statement of the
 * client, and the probe must never load an object of any size.
 */
export const MAXIMUM_IMAGE_SIZE_BYTES = 25 * 1024 * 1024;
