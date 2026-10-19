import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError } from "../errors.js";
import {
  getAccessibleWikiPage,
  WikiPageAccessTier,
} from "./getAccessibleWikiPage.js";
import type { WikiSharedContextPage } from "./wikiContext.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { loadWikiScopeOfPage } from "./wikiScope.js";

/** The upload as the download route needs it */
export interface WikiAttachmentDownload {
  readonly id: string;
  readonly fileName: string;
  readonly mimeType: string;
}

/**
 * The upload of an attachment that the actor may download. Unlike images
 * (public by unguessable URL), attachments are only for the actors who can
 * read a page that contains the upload.
 *
 * An upload can be linked to several pages (`Upload.wikiPageLinks`, for
 * example after a page duplication or a cross-page copy-paste). Any readable
 * linked page grants the download. A link of each kind counts, as with the
 * former link table, which also held the images.
 *
 * @throws NotFoundError when the upload does not exist, when no wiki page
 * links it, or when the actor cannot read any of its pages: invisible pages
 * and uploads outside the wiki look the same, thus their existence never
 * leaks
 */
export const findWikiAttachmentDownload = async (
  context: ApplicationContext,
  actor: Actor,
  { upload_id: uploadId }: { readonly upload_id: string },
): Promise<WikiAttachmentDownload> => {
  const upload = await context.prisma.upload.findUnique({
    where: { id: uploadId },
    select: {
      id: true,
      fileName: true,
      mimeType: true,
      wikiPageLinks: { select: { pageId: true }, distinct: ["pageId"] },
    },
  });
  if (!upload) throw new NotFoundError(WikiErrorMessage.AttachmentNotFound);

  /**
   * The linked pages can span scopes (global wiki and event pages), thus each
   * check loads the scope of its page. Uploads rarely link more than one page.
   */
  for (const { pageId } of upload.wikiPageLinks) {
    const scope = await loadWikiScopeOfPage(context, actor, pageId);
    if (
      scope &&
      getAccessibleWikiPage<WikiSharedContextPage>(
        scope,
        pageId,
        WikiPageAccessTier.Read,
      ) !== null
    )
      return {
        id: upload.id,
        fileName: upload.fileName,
        mimeType: upload.mimeType,
      };
  }

  throw new NotFoundError(WikiErrorMessage.AttachmentNotFound);
};
