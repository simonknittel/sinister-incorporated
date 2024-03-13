"use client";

import { getAlgoliaResults } from "@algolia/autocomplete-js";
import algoliasearch from "algoliasearch";
import { env } from "~/env.mjs";
import Autocomplete from "./Autocomplete";
import Citizen from "./Citizen";

export interface CitizenHit {
  objectID: string;
  spectrumId: string;
  handles: string[];
  citizenIds: string[];
  communityMonikers: string[];
}

const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY,
);

function debouncePromise(fn, time) {
  let timerId = undefined;

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
    <div className="w-full ">
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
              getItemUrl({ item }: { item: CitizenHit }) {
                return `/spynet/entity/${item.objectID}`;
              },
              templates: {
                item: ({ item }: { item: CitizenHit }) => (
                  <Citizen hit={item} />
                ),
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
        }}
        placeholder="Suche"
        // renderNoResults={() => "Kein Ergebnisse"} // TODO
      />
    </div>
  );
};

export default Search;
