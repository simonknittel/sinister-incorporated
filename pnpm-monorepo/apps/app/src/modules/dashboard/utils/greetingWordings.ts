/** What a wording of the welcome or the birthday banner can name */
export interface ViewerWordingContext {
  /** The handle of the viewer, or null when the viewer has none */
  readonly handle: string | null;
}

interface GreetingWording {
  readonly title: string;
  readonly body: string;
}

/**
 * One wording of a greeting banner. A wording is a function, because a
 * wording may name a value of the moment, for example the in-game year or
 * the handle of the viewer. Each pool sets its own context.
 */
export type GreetingWordingFactory<Context> = (
  context: Context,
) => GreetingWording;

export type ViewerWordingFactory = GreetingWordingFactory<ViewerWordingContext>;

/** How a wording addresses the viewer: by the handle, else as "Citizen" */
export const getGreetingName = ({ handle }: ViewerWordingContext) =>
  handle || "Citizen";

/**
 * One wording of the pool, picked at random on each render of the banner. A
 * citizen thus reads a different greeting on each visit. The pick keeps no
 * memory of the previous visit, thus the same wording can occur two times in
 * sequence. An empty pool has no wording to pick.
 */
export const pickRandomWording = <Context>(
  wordings: readonly GreetingWordingFactory<Context>[],
  context: Context,
): GreetingWording | null => {
  if (wordings.length === 0) return null;

  const index = Math.floor(Math.random() * wordings.length);

  return wordings[index]?.(context) ?? null;
};
