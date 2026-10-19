import {
  CopyObjectCommand,
  GetObjectCommand,
  type CopyObjectCommandOutput,
  type GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import type { FileStorage } from "@sam-monorepo/application";

/**
 * Shorter than the copy: a read sits inside an interactive save that also
 * waits on a different service afterwards, for example on Discord.
 */
const READ_TIMEOUT_MILLISECONDS = 10_000;

const COPY_TIMEOUT_MILLISECONDS = 30_000;

interface SendOptions {
  readonly abortSignal: AbortSignal;
}

export interface S3StorageOptions {
  /** An `S3Client`. The type names the two commands that the storage sends. */
  readonly client: {
    send(
      command: GetObjectCommand,
      options: SendOptions,
    ): Promise<GetObjectCommandOutput>;
    send(
      command: CopyObjectCommand,
      options: SendOptions,
    ): Promise<CopyObjectCommandOutput>;
  };
  readonly bucketName: string;
}

/**
 * The object storage of the uploads, on an S3-compatible bucket. The key of an
 * object is the ID of its upload. Every method throws on a storage error.
 */
export const createS3Storage = ({
  client,
  bucketName,
}: S3StorageOptions): FileStorage => ({
  readObject: async (key, { maximumBytes }) => {
    const object = await client.send(
      new GetObjectCommand({ Bucket: bucketName, Key: key }),
      { abortSignal: AbortSignal.timeout(READ_TIMEOUT_MILLISECONDS) },
    );
    if (!object.Body) return null;

    if (
      object.ContentLength !== undefined &&
      object.ContentLength > maximumBytes
    )
      return null;

    const bytes = await object.Body.transformToByteArray();
    // The declared length is only a header: an absent or incorrect one must
    // not let an object of unbounded size through
    if (bytes.byteLength === 0 || bytes.byteLength > maximumBytes) return null;

    return bytes;
  },

  copyObject: async ({ sourceKey, targetKey, contentType }) => {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${encodeURIComponent(sourceKey)}`,
        Key: targetKey,
        ContentType: contentType,
        // Without it, S3 keeps the metadata of the source and ignores the new
        // content type
        MetadataDirective: "REPLACE",
      }),
      { abortSignal: AbortSignal.timeout(COPY_TIMEOUT_MILLISECONDS) },
    );
  },
});
