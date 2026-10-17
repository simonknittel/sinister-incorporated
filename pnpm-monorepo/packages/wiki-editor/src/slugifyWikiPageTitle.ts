import slug from "slug";

/** The longest slug of the app (also of the career flows) */
const MAX_SLUG_LENGTH = 64;

/**
 * Derives the cosmetic URL slug from a page title: German transliteration,
 * lowercase, words joined by single dashes. Only the page id is used to
 * resolve a page, so collisions are fine — but the slug is part of the path
 * and therefore must never be empty.
 */
export const slugifyWikiPageTitle = (title: string) =>
  slug(title, { locale: "de" })
    .slice(0, MAX_SLUG_LENGTH)
    // The cap can cut mid-word and leave a dangling dash behind
    .replace(/-+$/, "") || "-";
