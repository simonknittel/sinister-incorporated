import { Command } from "cmdk";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { type CitizenHit } from "../../(app)/spynet/search/_components/Search";
import { env } from "../../../env.mjs";
import { SpynetSearchResultEntry } from "./SpynetSearchResultEntry";

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

export const SpynetSearchPage = ({ search, onSelect }: Props) => {
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
        <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2 mb-3" />
      ) : data.hits.length > 0 ? (
        data.hits.map((result) => (
          <SpynetSearchResultEntry
            key={result.objectID}
            citizen={result}
            onSelect={onSelect}
          />
        ))
      ) : (
        <Command.Item disabled>Keine Ergebnisse</Command.Item>
      )}
    </Command.Group>
  );
};
