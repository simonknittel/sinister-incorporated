import { env } from "@/env";
import { createS3Client as createS3ClientWithOptions } from "@sam-monorepo/infrastructure";

/**
 * S3 client for the uploads bucket. The endpoint is either an explicit
 * S3_ENDPOINT (any S3-compatible provider without per-bucket domains, e.g.
 * the local RustFS container — requires path-style addressing) or
 * derived from the Cloudflare R2 account id.
 */
export const createS3Client = () => {
  const endpoint =
    env.S3_ENDPOINT ??
    (env.S3_ACCOUNT_ID
      ? `https://${env.S3_ACCOUNT_ID}.r2.cloudflarestorage.com`
      : null);
  if (!endpoint)
    throw new Error("S3 is not configured: set S3_ENDPOINT or S3_ACCOUNT_ID");

  return createS3ClientWithOptions({
    endpoint,
    forcePathStyle: env.S3_ENDPOINT !== undefined,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
  });
};
