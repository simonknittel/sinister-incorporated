import { getApplicationContext } from "@/modules/application";
import {
  AuthorizationClientErrorReason,
  type AuthorizationRequestValidation,
  type AuthorizationRequestValidationKind,
} from "@sam-monorepo/application";
import * as z from "zod";
import { isMcpServerDisabled } from "./isMcpServerDisabled";

export enum ConsentAvailability {
  Available = "available",
  /** The kill switch is on */
  Disabled = "disabled",
  /** The app cannot sign access tokens */
  NoSigningKey = "noSigningKey",
}

export const getConsentAvailability = async () => {
  if (await isMcpServerDisabled()) return ConsentAvailability.Disabled;

  if (!(await getApplicationContext().signingKey()))
    return ConsentAvailability.NoSigningKey;

  return ConsentAvailability.Available;
};

export const CONSENT_UNAVAILABLE_MESSAGE =
  "Die Verbindung von Anwendungen über MCP ist zurzeit nicht verfügbar.";

export const ASSUMED_USER_MESSAGE =
  "Du siehst SAM gerade als ein anderer Benutzer. Beende diese Ansicht, um eine Anwendung mit deinem Account zu verbinden.";

export const getClientErrorMessage = (
  reason: AuthorizationClientErrorReason,
) => {
  switch (reason) {
    case AuthorizationClientErrorReason.InvalidClientId:
      return "Die Anwendung hat keine gültige Client-ID gesendet.";
    case AuthorizationClientErrorReason.ClientMetadataUnavailable:
      return "Die Beschreibung der Anwendung konnte nicht geladen werden. Bitte versuche es später erneut.";
    case AuthorizationClientErrorReason.InvalidClientMetadata:
      return "Die Beschreibung der Anwendung ist ungültig.";
    case AuthorizationClientErrorReason.InvalidRedirectUri:
      return "Die Anwendung hat eine Weiterleitungsadresse gesendet, die sie nicht registriert hat.";
    default:
      throw new Error(`Unknown reason: ${reason satisfies never}`);
  }
};

/**
 * The hidden fields of the approve and deny forms: the validated parameters
 * of the authorization request. The actions validate them again.
 */
export const toConsentFormParameters = (
  validation: Extract<
    AuthorizationRequestValidation,
    { kind: AuthorizationRequestValidationKind.Valid }
  >,
): Record<string, string> => ({
  response_type: "code",
  client_id: validation.client.clientId,
  redirect_uri: validation.redirectUri,
  code_challenge: validation.codeChallenge,
  code_challenge_method: "S256",
  scope: validation.scope,
  resource: validation.resource,
  ...(validation.state !== undefined && { state: validation.state }),
});

/**
 * The fields of the approve and deny forms. A field can be missing or not
 * valid: the use case validates them. The limits keep large values out of
 * the use case.
 */
export const consentFormSchema = z.record(
  z.string().max(100),
  z.string().max(4096),
);
