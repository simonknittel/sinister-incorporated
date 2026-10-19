import {
  collectWikiIframeSrcs,
  isWikiIframeSrcAllowed,
} from "@sam-monorepo/wiki-editor";
import * as z from "zod";
import type { ApplicationContext } from "../context.js";

/** `WikiSetting.key` of the hostnames that generic iframes may embed */
export const WIKI_SETTING_IFRAME_ALLOWLIST = "iframeAllowlist";

export const MAXIMUM_WIKI_IFRAME_ALLOWLIST_ENTRIES = 100;

const iframeAllowlistSchema = z
  .array(z.string())
  .max(MAXIMUM_WIKI_IFRAME_ALLOWLIST_ENTRIES);

/** The stored value of the setting. An invalid value allows no hostname. */
export const parseWikiIframeAllowlist = (value: unknown): string[] => {
  const parsed = iframeAllowlistSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
};

/**
 * Hostnames generic iframes may embed. Used by the insertion-time
 * validation and passed to the renderers for the render-time re-check.
 */
export const loadWikiIframeAllowlist = async (
  prisma: ApplicationContext["prisma"],
): Promise<string[]> => {
  const setting = await prisma.wikiSetting.findUnique({
    where: { key: WIKI_SETTING_IFRAME_ALLOWLIST },
  });
  return parseWikiIframeAllowlist(setting?.value);
};

/**
 * The sources of the generic iframes of the content whose hosts are not on
 * the allowlist. Content that does not come from the editor (an import, a
 * Markdown text) bypasses the insertion-time validation, thus its writes
 * check it with this function.
 */
export const findDisallowedWikiIframeSources = async (
  prisma: ApplicationContext["prisma"],
  content: unknown,
): Promise<string[]> => {
  const iframeAllowlist = await loadWikiIframeAllowlist(prisma);

  return collectWikiIframeSrcs(content).filter(
    (source) => !isWikiIframeSrcAllowed(source, iframeAllowlist),
  );
};
