import { env } from "@/env";
import {
  getApplicationContext,
  toActor,
} from "@/modules/application";
import { requireAuthenticationApi } from "@/modules/auth/server";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import { createS3Client } from "@/modules/common/utils/createS3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  findWikiAttachmentDownload,
  idSchema,
  NotFoundError,
} from "@sam-monorepo/application";
import { NextResponse } from "next/server";
import * as z from "zod";

const paramsSchema = z.object({ uploadId: idSchema });

const PRESIGNED_GET_EXPIRY_SECONDS = 5 * 60;

/**
 * Permission-checked download of a wiki page attachment. Unlike images
 * (public by unguessable URL), attachments are only served to users who can
 * see a page containing the upload — via a redirect to a short-lived
 * presigned URL (see `findWikiAttachmentDownload()`).
 */
export async function GET(
  _request: Request,
  context: RouteContext<"/api/wiki/attachment/[uploadId]">,
) {
  try {
    const authentication = await requireAuthenticationApi(
      "/api/wiki/attachment/[uploadId]",
      "GET",
    );

    const paramsData = paramsSchema.parse(await context.params);

    const upload = await findWikiAttachmentDownload(
      getApplicationContext(),
      await toActor(authentication.session),
      { upload_id: paramsData.uploadId },
    );

    const presignedUrl = await getPresignedDownloadUrl(upload);

    return NextResponse.redirect(presignedUrl, 307);
  } catch (error) {
    /**
     * Invisible pages (and uploads outside the wiki) 404 instead of 403 to
     * avoid leaking their existence.
     */
    if (error instanceof NotFoundError)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });

    return apiErrorHandler(error);
  }
}

async function getPresignedDownloadUrl(upload: {
  id: string;
  fileName: string;
  mimeType: string;
}) {
  /**
   * The stored file name is already URI-encoded (see useUpload/the wiki
   * upload helper), matching the RFC 5987 `filename*` percent-encoding —
   * except for the apostrophe, which encodeURIComponent leaves as-is but
   * RFC 5987 uses as a delimiter.
   */
  const encodedFileName = upload.fileName.replaceAll("'", "%27");

  return await getSignedUrl(
    createS3Client(),
    new GetObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: upload.id,
      ResponseContentType: upload.mimeType,
      ResponseContentDisposition: `attachment; filename*=UTF-8''${encodedFileName}`,
    }),
    {
      expiresIn: PRESIGNED_GET_EXPIRY_SECONDS,
    },
  );
}
