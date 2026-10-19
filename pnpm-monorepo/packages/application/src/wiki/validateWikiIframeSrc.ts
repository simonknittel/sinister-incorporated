import { isWikiIframeSrcAllowed } from "@sam-monorepo/wiki-editor";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { ValidationError } from "../errors.js";
import { WikiErrorMessage } from "./wikiErrors.js";
import { loadWikiIframeAllowlist } from "./wikiIframeAllowlist.js";

export const MAXIMUM_WIKI_IFRAME_SOURCE_LENGTH = 2_000;

export const validateWikiIframeSrcInputSchema = z.object({
  src: z.url().max(MAXIMUM_WIKI_IFRAME_SOURCE_LENGTH),
});

export type ValidateWikiIframeSrcInput = z.output<
  typeof validateWikiIframeSrcInputSchema
>;

export interface ValidateWikiIframeSrcOutput {
  readonly src: string;
}

/**
 * Insertion-time check of a generic iframe URL against the current allowlist.
 * The static renderer and the editor re-validate on every render, so this is
 * UX (fail early with a clear message), not the only line of defense. Needs
 * no permission beyond the clearance that the caller checks.
 *
 * @throws ValidationError when the URL is not one of the dedicated providers
 * and its host is not on the allowlist
 */
export const validateWikiIframeSrc = async (
  context: ApplicationContext,
  _actor: Actor,
  input: ValidateWikiIframeSrcInput,
): Promise<ValidateWikiIframeSrcOutput> => {
  const allowlist = await loadWikiIframeAllowlist(context.prisma);
  if (!isWikiIframeSrcAllowed(input.src, allowlist))
    throw new ValidationError(WikiErrorMessage.IframeSourceNotAllowed);

  return { src: input.src };
};
