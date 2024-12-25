import { env } from "@/env";
import { Command } from "cmdk";
import { debounce } from "lodash";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Hero } from "../Hero";
import { type Hit } from "../SpynetSearchTile/Search";
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
  hits: Array<Hit>;
}>;

type Props = Readonly<{
  search: string;
  onSelect?: () => void;
}>;

export const SpynetSearchPage = ({ search, onSelect }: Props) => {
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const router = useRouter();

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

  const showDogfightTrainer = !isValidating && data && search.match(/knebel/i);

  return (
    <Command.Group heading="Spynet > Suchen">
      {isValidating || !data ? (
        <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2 mb-3" />
      ) : data.hits.length > 0 ? (
        data.hits.map((result) => (
          <SpynetSearchResultEntry
            key={result.objectID}
            hit={result}
            onSelect={onSelect}
          />
        ))
      ) : (
        <Command.Item disabled>Keine Ergebnisse</Command.Item>
      )}

      {showDogfightTrainer && (
        <Command.Item
          onSelect={() => {
            router.push(
              "https://sam.sinister-incorporated.de/dogfight-trainer",
            );
          }}
        >
          <Hero
            text="Dogfight Trainer"
            size="md"
            asSpan
            withGlitch
            className="mx-auto"
          />
        </Command.Item>
      )}
    </Command.Group>
  );
};
