import type { ConfirmationStatus } from "@sam-monorepo/database/client";
import type { GenericCitizenLogType } from "@sam-monorepo/domain";
import { requirePermission, type Actor } from "../actor.js";
import type { ApplicationContext } from "../context.js";
import {
  getConfirmationFilterWhere,
  loadCitizenLogTablePage,
  type CitizenLogTablePage,
  type CitizenLogTablePageOptions,
  type CitizenLogTablePageRequest,
} from "./citizenLogTablePage.js";
import { IDENTITY_LOG_TYPES } from "./identityLogTypes.js";
import { getReadableCitizenLogWhere } from "./readableCitizenLogWhere.js";

export interface IdentityLogTablePageInput extends CitizenLogTablePageRequest {
  /** The values of the URL filters. Empty for no filter. */
  readonly filters: {
    readonly types: readonly string[];
    /**
     * The raw values (`ConfirmationValue`): an unknown value adds no
     * condition, thus only unknown values match no log
     */
    readonly confirmationValues: readonly string[];
  };
}

export interface IdentityLogTablePage extends CitizenLogTablePage {
  /** The values that at least one visible log has: the filters offer them */
  readonly options: {
    readonly types: GenericCitizenLogType[];
    readonly confirmationStates: (ConfirmationStatus | null)[];
  };
}

/**
 * One page of the table of the identity logs (handles, IDs, …) of the
 * Spynet. Requires `citizen;read` and `spynetOther;read`, like the page.
 */
export const findIdentityLogTablePage = async (
  context: Pick<ApplicationContext, "prisma">,
  actor: Actor,
  { filters, ...pageRequest }: IdentityLogTablePageInput,
  options: CitizenLogTablePageOptions,
): Promise<IdentityLogTablePage> => {
  requirePermission(actor, "citizen", "read");
  requirePermission(actor, "spynetOther", "read");

  const visibleWhere = await getReadableCitizenLogWhere(
    context,
    actor,
    IDENTITY_LOG_TYPES,
  );

  const [page, filterOptions] = await Promise.all([
    loadCitizenLogTablePage(
      context,
      {
        AND: [
          visibleWhere,
          getConfirmationFilterWhere(filters.confirmationValues),
          filters.types.length > 0 ? { type: { in: [...filters.types] } } : {},
        ],
      },
      pageRequest,
      options,
    ),
    context.prisma.citizenLog.groupBy({
      by: ["type", "confirmed"],
      where: visibleWhere,
    }),
  ]);

  return {
    ...page,
    options: {
      types: [
        ...new Set(
          filterOptions.flatMap((option) =>
            IDENTITY_LOG_TYPES.filter((type) => type === option.type),
          ),
        ),
      ],
      confirmationStates: [
        ...new Set(filterOptions.map((option) => option.confirmed)),
      ],
    },
  };
};
