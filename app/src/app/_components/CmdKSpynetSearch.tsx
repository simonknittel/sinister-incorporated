import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { env } from "~/env.mjs";
import { type CitizenHit } from "../(app)/spynet/search/_components/Search";

type Props = Readonly<{
  search: string;
  onSelect?: () => void;
}>;

export const CmdKSpynetSearch = ({ search, onSelect }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<CitizenHit>>([]);

  useEffect(() => {
    setLoading(true);
    // https://www.algolia.com/doc/rest-api/search/#search-endpoints
    fetch(
      `https://${env.NEXT_PUBLIC_ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/spynet_entities?query=${search}&hitsPerPage=5`,
      {
        headers: {
          "X-Algolia-Application-Id": env.NEXT_PUBLIC_ALGOLIA_APP_ID,
          "X-Algolia-API-Key": env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
        },
      },
    )
      .then((response) => response.json())
      .then(({ hits }) => {
        setResults(hits);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, [search]);

  return (
    <>
      {loading ? (
        <>
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8" />
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2" />
          <div className="animate-pulse rounded bg-neutral-700 h-24 mx-8 mt-2" />
        </>
      ) : (
        results.map((result) => (
          <Command.Item
            key={result.objectID}
            onSelect={() => {
              router.push(`/spynet/entity/${result.objectID}`);
              onSelect?.();
            }}
            className="flex flex-col !gap-0 [&+&]:mt-2"
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
      )}
    </>
  );
};
