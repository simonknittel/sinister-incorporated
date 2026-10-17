import type { SpynetSearchHit } from "@sam-monorepo/application";
import { SpynetSearchHitType } from "@sam-monorepo/domain";

/**
 * The client components import only the types of the application package:
 * its values need the server
 */
export type {
  CitizenSearchHit,
  OrganizationSearchHit,
  SpynetSearchHit,
} from "@sam-monorepo/application";
export {
  SPYNET_SEARCH_QUERY_MAXIMUM_LENGTH,
  SPYNET_SEARCH_QUERY_MINIMUM_LENGTH,
  SpynetSearchHitType,
} from "@sam-monorepo/domain";

export const getSpynetSearchHitHref = (hit: SpynetSearchHit) => {
  switch (hit.type) {
    case SpynetSearchHitType.Citizen:
      return `/app/spynet/citizen/${hit.id}`;

    case SpynetSearchHitType.Organization:
      return `/app/spynet/organization/${hit.id}`;

    default:
      throw new Error(`Unknown hit type: ${hit satisfies never}`);
  }
};
