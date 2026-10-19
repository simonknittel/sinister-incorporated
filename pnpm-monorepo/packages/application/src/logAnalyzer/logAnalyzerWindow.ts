const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * The filter on `eventAt` for the given window, for the queries of the
 * sharing. Undefined loads without a time limit, as the local parsing does.
 */
export const getEventAtWindow = (daysToLoad: number, now: Date) =>
  daysToLoad > 0
    ? { gte: new Date(now.getTime() - daysToLoad * MILLISECONDS_PER_DAY) }
    : undefined;
