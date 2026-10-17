/**
 * The Markdown renderer of the wiki content. It is a separate entry, thus the
 * consumers of the main entry (for example the collab server) do not load
 * the static renderer.
 */
export {
  renderWikiContentToMarkdown,
  type WikiMarkdownOptions,
} from "./renderWikiContentToMarkdown.js";
