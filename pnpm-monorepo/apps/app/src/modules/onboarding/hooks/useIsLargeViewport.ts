"use client";

import { useMediaQuery } from "@base-ui/react/unstable-use-media-query";

/**
 * The default `lg` breakpoint of Tailwind. From this width, the top bar
 * replaces the mobile action bar.
 */
const LARGE_VIEWPORT_QUERY = "(min-width: 64rem)";

/**
 * Tells which popover surface of the shell is visible: the top bar on a
 * large viewport, the mobile action bar on a small one.
 *
 * `noSsr` gives the real value also while React hydrates. Thus a streamed
 * part of the shell, for example the mobile action bar, does not decide with
 * the value of the server. Use the value only for decisions on the client,
 * never for the markup.
 */
export const useIsLargeViewport = () =>
  useMediaQuery(LARGE_VIEWPORT_QUERY, { noSsr: true });
