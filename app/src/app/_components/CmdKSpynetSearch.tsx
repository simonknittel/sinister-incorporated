import { Command } from "cmdk";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { type CitizenHit } from "../(app)/spynet/search/_components/Search";
import { env } from "../../env.mjs";

const fetcher = async (key: string) => {
  const res = await fetch(key, {
    headers: {
      "X-Algolia-Application-Id": env.NEXT_PUBLIC_ALGOLIA_APP_ID,
      "X-Algolia-API-Key": env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
    },
  });

  return res.json();
};

type AlgoliaResponse = Readonly<{
  hits: Array<CitizenHit>;
}>;

type Props = Readonly<{
  search: string;
  onSelect?: () => void;
}>;

export const CmdKSpynetSearch = ({ search, onSelect }: Props) => {
  const router = useRouter();
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  const handleSearch = (value: string) => {
    setDebouncedSearch(value);
  };

  const debouncedHandleSearch = useMemo(() => debounce(handleSearch, 500), []);

  const { data, isValidating } = useSWR<AlgoliaResponse>(
    `https://${env.NEXT_PUBLIC_ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/spynet_entities?query=${debouncedSearch}&hitsPerPage=5`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  useEffect(() => {
    debouncedHandleSearch(search);
  }, [debouncedHandleSearch, search]);

  return (
    <Command.Group heading="Spynet > Suchen">
      {isValidating || !data ? (
        <>
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2" />
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2" />
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2 mb-3" />
        </>
      ) : data.hits.length > 0 ? (
        data.hits.map((result) => (
          <Command.Item
            key={result.objectID}
            onSelect={() => {
              router.push(`/spynet/entity/${result.objectID}`);
              onSelect?.();
            }}
            className="flex flex-col !gap-0 mt-2"
          >
            {result.handles && result.handles.length > 0 ? (
              <span className="flex gap-2 items-baseline w-full">
                <p>{result.handles[0]}</p>

                {result.handles.length > 1 && (
                  <p className="text-neutral-500 text-sm">
                    {result.handles.slice(1).join(", ")}
                  </p>
                )}
              </span>
            ) : (
              <p className="italic text-neutral-500 w-full">Unbekannt</p>
            )}

            <span className="block text-sm text-neutral-500 w-full">
              {result.communityMonikers &&
                result.communityMonikers.length > 0 && (
                  <p>
                    Community Monikers: {result.communityMonikers.join(", ")}
                  </p>
                )}

              <p>Spectrum ID: {result.spectrumId}</p>

              {result.citizenIds && result.citizenIds.length > 0 && (
                <p>Citizen IDs: {result.citizenIds.join(", ")}</p>
              )}

              <p>Sinister ID: {result.objectID}</p>
            </span>
          </Command.Item>
        ))
      ) : (
        <Command.Item disabled>Keine Ergebnisse</Command.Item>
      )}
    </Command.Group>
  );
};
