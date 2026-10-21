import type { PrismaClientType } from "@sam-monorepo/database";
import { FlowSlugProblem, findFlowSlugProblem } from "@sam-monorepo/domain";
import { ValidationError } from "../errors.js";
import { CareerErrorMessage } from "./careerErrors.js";

const SLUG_PROBLEM_MESSAGES: Record<FlowSlugProblem, CareerErrorMessage> = {
  [FlowSlugProblem.Format]: CareerErrorMessage.SlugFormat,
  [FlowSlugProblem.Reserved]: CareerErrorMessage.SlugReserved,
};

/**
 * Throws a `ValidationError` when a flow cannot use the slug: the format, a
 * reserved segment, or a different live flow that uses it. The partial
 * unique index on the rows that are not deleted is the last guard: the
 * writes map its error to `CareerErrorMessage.SlugTaken` too.
 */
export const requireUsableFlowSlug = async (
  client: Pick<PrismaClientType, "flow">,
  slug: string,
  { exceptFlowId }: { readonly exceptFlowId?: string } = {},
) => {
  const problem = findFlowSlugProblem(slug);
  if (problem) throw new ValidationError(SLUG_PROBLEM_MESSAGES[problem]);

  const takenSlug = await client.flow.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(exceptFlowId === undefined ? {} : { id: { not: exceptFlowId } }),
    },
    select: { id: true },
  });
  if (takenSlug) throw new ValidationError(CareerErrorMessage.SlugTaken);
};

/** The position after the last live flow, 1 when no flow exists */
export const getNextFlowPosition = async (
  client: Pick<PrismaClientType, "flow">,
) => {
  const lastFlow = await client.flow.findFirst({
    where: { deletedAt: null },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  return (lastFlow?.position ?? 0) + 1;
};
