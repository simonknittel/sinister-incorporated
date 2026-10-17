/**
 * The proxy adds this search param to the login page URL when it redirects an
 * unauthenticated user away from a deep link. After the login, the user goes
 * back to the deep link.
 */
export const REDIRECT_TO_SEARCH_PARAM = "redirect-to";

/**
 * The proxy gives the path and the query of each `/app` request to the server
 * in this request header, because a layout cannot read the URL. The proxy
 * replaces a value that the client sends.
 */
export const REQUEST_PATH_HEADER = "x-sam-request-path";

/**
 * This dummy origin makes it possible to parse and build a relative path with
 * `URL`. No request goes to this origin.
 */
const DUMMY_ORIGIN = "http://redirect-to-validation.internal";

/**
 * Validates the value of the `redirect-to` search param.
 *
 * To prevent an open redirect, the function only accepts a relative path that
 * stays on the same origin and points into `/app`. `URL.parse()` normalizes
 * traversal segments (`..`) and backslashes, and the checks operate on the
 * normalized result. `URL.parse()` is not yet Baseline "widely available",
 * but only server code calls this function.
 *
 * @returns The normalized path together with its search params, or `null` if
 * the value is not a safe target.
 */
export const validateRedirectTo = (value: string | null): string | null => {
  if (!value?.startsWith("/")) return null;

  const url = URL.parse(value, DUMMY_ORIGIN);

  // A value such as `//evil.example.com` resolves to a different origin
  if (url?.origin !== DUMMY_ORIGIN) return null;

  if (url.pathname !== "/app" && !url.pathname.startsWith("/app/")) return null;

  return url.pathname + url.search;
};

/**
 * The path of the login page. After the login, the login page sends the user
 * to `redirectTo`. Give only a value that `validateRedirectTo()` accepted.
 */
export const getLoginPath = (redirectTo: string | null) => {
  const loginUrl = new URL("/", DUMMY_ORIGIN);
  if (redirectTo)
    loginUrl.searchParams.set(REDIRECT_TO_SEARCH_PARAM, redirectTo);

  return loginUrl.pathname + loginUrl.search;
};
