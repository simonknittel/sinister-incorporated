import {
  buildVisibleWikiTree,
  buildWikiPageHref,
  type WikiTreeNode,
} from "@sam-monorepo/wiki-editor/helpers";
import * as z from "zod";
import type { Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import { NotFoundError, ValidationError } from "../errors.js";
import { withSpan } from "../withSpan.js";
import { loadReadableWikiScope } from "./readableWikiScope.js";

/**
 * The maximum length of an id: a cuid has 25 characters, a cuid2 at most 32.
 * The id of a page is also the cursor.
 */
const MAXIMUM_ID_LENGTH = 32;

export const listWikiPagesInputSchema = z.object({
  /** The briefing of this event instead of the global wiki */
  event_id: z.cuid().max(MAXIMUM_ID_LENGTH).optional(),
  /** Only the pages below this page */
  parent_id: z.cuid2().max(MAXIMUM_ID_LENGTH).optional(),
  limit: z.number().int().min(1).max(100).default(25),
  /** The `next_cursor` of the previous call */
  cursor: z.cuid2().max(MAXIMUM_ID_LENGTH).optional(),
});

export type ListWikiPagesInput = z.output<typeof listWikiPagesInputSchema>;

export interface WikiPageListItem {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  /** The route of the page, relative to the base URL of the app */
  readonly path: string;
  readonly icon_id: string | null;
  /** The parent page in the tree, or null for a page at the top of the tree */
  readonly parent_id: string | null;
  /** 0 for a page at the top of the list */
  readonly depth: number;
  /** The number of readable subpages */
  readonly child_count: number;
}

export interface ListWikiPagesOutput {
  /** The readable pages in the order of the page tree (depth first) */
  readonly pages: WikiPageListItem[];
  /** Null when there are no more pages */
  readonly next_cursor: string | null;
}

interface FlatWikiTreeNode {
  readonly node: WikiTreeNode;
  readonly parentId: string | null;
  readonly depth: number;
}

const flattenWikiTree = (
  nodes: readonly WikiTreeNode[],
  parentId: string | null,
  depth: number,
): FlatWikiTreeNode[] =>
  nodes.flatMap((node) => [
    { node, parentId, depth },
    ...flattenWikiTree(node.children, node.id, depth + 1),
  ]);

const findWikiTreeNode = (
  nodes: readonly WikiTreeNode[],
  pageId: string,
): WikiTreeNode | null => {
  for (const node of nodes) {
    if (node.id === pageId) return node;

    const descendant = findWikiTreeNode(node.children, pageId);
    if (descendant) return descendant;
  }

  return null;
};

/**
 * The pages that the actor can read in the global wiki or in the briefing of
 * an event, in the order and the hierarchy of the sidebar
 */
export const listWikiPages = (
  context: ApplicationContext,
  actor: Actor,
  input: ListWikiPagesInput,
): Promise<ListWikiPagesOutput> =>
  withSpan(context, "listWikiPages", async () => {
    const scope = await loadReadableWikiScope(context, actor, input.event_id);
    const tree = buildVisibleWikiTree(
      scope.context.pages,
      scope.context.permissions,
    );

    let topNodes = tree;
    if (input.parent_id !== undefined) {
      const parent = findWikiTreeNode(tree, input.parent_id);
      if (!parent) throw new NotFoundError("The parent page does not exist");
      topNodes = parent.children;
    }

    const flatNodes = flattenWikiTree(topNodes, input.parent_id ?? null, 0);

    let start = 0;
    if (input.cursor !== undefined) {
      const cursorIndex = flatNodes.findIndex(
        ({ node }) => node.id === input.cursor,
      );
      if (cursorIndex === -1)
        throw new ValidationError("The cursor is not valid", {
          field: "cursor",
        });
      start = cursorIndex + 1;
    }

    const items = flatNodes.slice(start, start + input.limit);
    const hasMore = start + items.length < flatNodes.length;

    return {
      pages: items.map(({ node, parentId, depth }) => ({
        id: node.id,
        title: node.title,
        slug: node.slug,
        path: buildWikiPageHref(scope.hrefBase, node),
        icon_id: node.iconId,
        parent_id: parentId,
        depth,
        child_count: node.children.length,
      })),
      next_cursor: hasMore ? (items.at(-1)?.node.id ?? null) : null,
    };
  });
