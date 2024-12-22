export type NextjsSearchParams = Record<string, string | string[] | undefined>;

export default function searchParamsNextjsToURLSearchParams(
  nextjsSearchParams: NextjsSearchParams,
): URLSearchParams {
  const nativeSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(nextjsSearchParams)) {
    const v = typeof value === "string" ? value : value?.[0];
    if (!v) continue;
    nativeSearchParams.set(key, v);
  }

  return nativeSearchParams;
}
