/** Where a paste puts the copied pages */
export enum WikiPasteMode {
  /** Below the target page, or at the top level without a target */
  Child = "child",
  /**
   * The target page keeps its identity and takes over the content, the icon,
   * the tags and the sidebar mode of the copied page
   */
  Replace = "replace",
}

/** Where a dropped page goes, relative to the page that it was dropped on */
export enum WikiPageDropPosition {
  Before = "before",
  After = "after",
  Inside = "inside",
}
