"use client";

import { getAlgoliaResults } from "@algolia/autocomplete-js";
import algoliasearch from "algoliasearch";
import clsx from "clsx";
import { env } from "~/env.mjs";
import Autocomplete from "./Autocomplete";
import Citizen from "./Citizen";
import styles from "./Search.module.css";

export interface CitizenHit {
  objectID: string;
  spectrumId: string;
  handles: string[];
}

const searchClient = algoliasearch(
  env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY
);

const Search = () => {
  return (
    <div className={clsx(styles.search, "w-full")}>
      <Autocomplete
        openOnFocus={true}
        getSources={({ query }) => [
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
            templates: {
              item({ item }: { item: CitizenHit }) {
                return <Citizen hit={item} />;
              },
            },
          },
        ]}
      />
    </div>
  );
};

export default Search;
