/**
 * The use cases of SAM. They do not depend on Next.js or on the MCP
 * transport, thus the Next.js app and the MCP server use the same use cases.
 * See the README for the conventions.
 */
export {
  createActor,
  requirePermission,
  type Actor,
  type ActorCitizen,
  type ActorFields,
} from "./actor.js";
export {
  getEffectiveRolesOfCitizen,
  type EffectiveRoles,
} from "./auth/getEffectiveRolesOfCitizen.js";
export * from "./changelog/index.js";
export type {
  ApplicationContext,
  ChangelogEntrySource,
  LogArguments,
  Logger,
  Notification,
  SigningKey,
  WikiPageContentReplacement,
} from "./context.js";
export {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "./errors.js";
export * from "./events/index.js";
export * from "./fleet/index.js";
export * from "./lineup/index.js";
export * from "./mcpSettings/index.js";
export {
  issueAccessToken,
  verifyAccessToken,
  type VerifiedAccessToken,
} from "./oauth/accessToken.js";
export {
  createGrantWithAuthorizationCode,
  type CreateGrantWithAuthorizationCodeInput,
  type CreateGrantWithAuthorizationCodeOutput,
} from "./oauth/createGrantWithAuthorizationCode.js";
export {
  InvalidTokenError,
  OAuthTokenError,
  OAuthTokenErrorCode,
  SigningKeyUnavailableError,
} from "./oauth/errors.js";
export { matchRedirectUri } from "./oauth/matchRedirectUri.js";
export {
  getAuthorizationServerMetadata,
  getProtectedResourceMetadata,
} from "./oauth/metadata.js";
export {
  redeemAuthorizationCode,
  redeemAuthorizationCodeInputSchema,
} from "./oauth/redeemAuthorizationCode.js";
export {
  refreshAccessToken,
  refreshAccessTokenInputSchema,
} from "./oauth/refreshAccessToken.js";
export {
  ClientMetadataError,
  ClientMetadataErrorReason,
  resolveClientMetadata,
  resolveClientMetadataInputSchema,
  type ClientMetadata,
} from "./oauth/resolveClientMetadata.js";
export {
  resolvePrincipal,
  type Principal,
  type PrincipalGrant,
} from "./oauth/resolvePrincipal.js";
export { revokeToken, revokeTokenInputSchema } from "./oauth/revokeToken.js";
export type { TokenResponse } from "./oauth/tokenResponse.js";
export {
  AuthorizationClientErrorReason,
  AuthorizationErrorCode,
  AuthorizationRequestValidationKind,
  authorizationRequestSchema,
  buildAuthorizationResponseUrl,
  validateAuthorizationRequest,
  type AuthorizationRequestParameters,
  type AuthorizationRequestValidation,
} from "./oauth/validateAuthorizationRequest.js";
export * from "./penaltyPoints/index.js";
export * from "./readMarkers/index.js";
export * from "./spynet/index.js";
export * from "./tasks/index.js";
export * from "./wiki/index.js";
export { withSpan } from "./withSpan.js";
