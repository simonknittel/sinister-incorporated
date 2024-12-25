"use client";

import { env } from "@/env";
import { getAlgoliaResults } from "@algolia/autocomplete-js";
import algoliasearch from "algoliasearch";
import Autocomplete from "./Autocomplete";
import { Citizen } from "./Citizen";
import { Organization } from "./Organization";

type HitBase = Readonly<{
  objectID: string;
  spectrumId: string;
}>;

export type CitizenHit = HitBase & {
  type: "citizen";
  handles?: string[];
  citizenIds?: string[];
  communityMonikers?: string[];
};

export type OrganizationHit = HitBase & {
  type: "organization";
  names: Array<string>;
};

export type Hit = CitizenHit | OrganizationHit;

const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

function debouncePromise(fn, time) {
  let timerId: NodeJS.Timeout | undefined = undefined;

  return function debounced(...args) {
    if (timerId) {
      clearTimeout(timerId);
    }

    return new Promise((resolve) => {
      timerId = setTimeout(() => resolve(fn(...args)), time);
    });
  };
}

const debounced = debouncePromise((items) => Promise.resolve(items), 300);

const Search = () => {
  return (
    <div className="w-full">
      <Autocomplete
        openOnFocus={true}
        getSources={({ query }) => {
          return debounced([
            {
              sourceId: "algolia",
              getItems() {
                return getAlgoliaResults({
                  searchClient,
                  queries: [
                    {
                      indexName: "spynet_entities",
                      query,
                    },
                  ],
                });
              },
              getItemUrl({ item }: { item: Hit }) {
                return `/app/spynet/entity/${item.objectID}`;
              },
              templates: {
                item: ({ item }: { item: Hit }) => {
                  if (item.type === "citizen") {
                    return <Citizen hit={item} />;
                  } else if (item.type === "organization") {
                    return <Organization hit={item} />;
                  }
                },
              },
            },
          ]);
        }}
        classNames={{
          form: "!bg-neutral-800 !border-transparent !shadow-none !outline-none focus-within:!border-white !rounded",
          input: "!text-white placeholder:!text-neutral-500",
          panel: "!bg-neutral-800 [&>.aa-GradientBottom]:!hidden",
          panelLayout: "!p-0",
          item: "!text-white !p-4 aria-selected:!bg-neutral-700",
          submitButton: "[&>svg]:!text-sinister-red-500",
          clearButton:
            "hover:!text-sinister-red-500 focus:!text-sinister-red-500",
          loadingIndicator: "[&>svg]:!text-sinister-red-500",
          detachedSearchButton: "!static",
        }}
        placeholder="Suche"
        // renderNoResults={() => "Kein Ergebnisse"} // TODO
      />
    </div>
  );
};

export default Search;
