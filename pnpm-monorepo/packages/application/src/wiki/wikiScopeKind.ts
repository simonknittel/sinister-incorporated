/**
 * The kinds of the wiki scopes. A scope is the set of pages that a request
 * works on, with the permissions of the actor (see `wikiScope.ts`).
 */
export enum WikiScopeKind {
  /** The global wiki with the role-based permissions */
  Wiki = "wiki",
  /** The briefing of an event or of an event template */
  Briefing = "briefing",
  /** The subtree of the global wiki that a fleet variant embeds */
  Variant = "variant",
}
