import { getWikiEditorSchema } from "@sam-monorepo/wiki-editor";

/**
 * The content as the current schema of the editor holds it. Content that
 * does not come from the editor (an imported file, a snapshot of an older
 * editor version) can have unknown nodes or marks or an invalid structure.
 *
 * @throws when the schema of the editor cannot hold the content
 */
export const normalizeWikiContent = (content: unknown): object => {
  const documentNode = getWikiEditorSchema().nodeFromJSON(content);
  documentNode.check();

  return documentNode.toJSON() as object;
};
