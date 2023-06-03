export default function nextjsSearchParamsToNativeSearchParams(nextjsSearchParams: {
  [key: string]: string | string[] | undefined;
}): URLSearchParams {
  const nativeSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(nextjsSearchParams)) {
    const v = typeof value === "string" ? value : value?.[0];
    if (!v) continue;
    nativeSearchParams.set(key, v);
  }

  return nativeSearchParams;
}
