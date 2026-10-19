import { getApplicationContext, toActor } from "@/modules/application";
import { requireAuthenticationApi } from "@/modules/auth/server";
import apiErrorHandler from "@/modules/common/utils/apiErrorHandler";
import {
  createWikiAttachmentDownloadUrl,
  createWikiAttachmentDownloadUrlInputSchema,
  idSchema,
  NotFoundError,
} from "@sam-monorepo/application";
import { NextResponse } from "next/server";
import * as z from "zod";

const paramsSchema = z.object({ uploadId: idSchema });

/**
 * Permission-checked download of a wiki page attachment. Unlike images
 * (public by unguessable URL), attachments are only served to users who can
 * see a page containing the upload — via a redirect to a short-lived
 * presigned URL (see `createWikiAttachmentDownloadUrl()`).
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

    const { url } = await createWikiAttachmentDownloadUrl(
      getApplicationContext(),
      await toActor(authentication.session),
      createWikiAttachmentDownloadUrlInputSchema.parse({
        upload_id: paramsData.uploadId,
      }),
    );

    return NextResponse.redirect(url, 307);
  } catch (error) {
    /**
     * Invisible pages (and uploads outside the wiki) 404 instead of 403 to
     * avoid leaking their existence. Without a bucket, the route answers 500.
     */
    if (error instanceof NotFoundError)
      return NextResponse.json({ error: "Not Found" }, { status: 404 });

    return apiErrorHandler(error);
  }
}
