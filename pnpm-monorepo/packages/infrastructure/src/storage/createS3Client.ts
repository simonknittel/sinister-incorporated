import { S3Client } from "@aws-sdk/client-s3";

/** The maximum time to open a connection to the bucket */
const CONNECTION_TIMEOUT_MILLISECONDS = 5_000;

/**
 * The maximum time of one request with its response. It is the longest
 * timeout of a single storage operation (a copy of an object). A caller that
 * needs a shorter time passes an `abortSignal` to `send()`.
 */
const REQUEST_TIMEOUT_MILLISECONDS = 30_000;

export interface S3ClientOptions {
  /**
   * The endpoint of the S3-compatible provider, for example
   * `https://<account>.r2.cloudflarestorage.com` for Cloudflare R2
   */
  readonly endpoint: string;
  /**
   * Path-style addressing, for a provider without a domain for each bucket
   * (for example the local RustFS container)
   */
  readonly forcePathStyle?: boolean;
  readonly credentials: {
    readonly accessKeyId: string;
    readonly secretAccessKey: string;
  };
}

export const createS3Client = ({
  endpoint,
  forcePathStyle = false,
  credentials,
}: S3ClientOptions): S3Client =>
  new S3Client({
    region: "auto",
    endpoint,
    forcePathStyle,
    /*
     * Since the data integrity protections of the SDK (3.729.0), presigned
     * PUT URLs embed a CRC32 checksum of the empty command body. R2 ignores
     * it, but stricter S3-compatible providers reject the actual upload body
     * of the browser with BadDigest. WHEN_REQUIRED restores the previous
     * behavior — the recommended setting for S3-compatible providers,
     * including R2.
     */
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
    credentials,
    requestHandler: {
      connectionTimeout: CONNECTION_TIMEOUT_MILLISECONDS,
      requestTimeout: REQUEST_TIMEOUT_MILLISECONDS,
      // Without this option, the SDK only logs a warning when the request
      // timeout is over, and the request continues
      throwOnRequestTimeout: true,
    },
  });
