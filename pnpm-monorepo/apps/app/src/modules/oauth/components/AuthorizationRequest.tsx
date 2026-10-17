import { getApplicationContext } from "@/modules/application";
import {
  AuthorizationRequestValidationKind,
  buildAuthorizationResponseUrl,
  validateAuthorizationRequest,
  type AuthorizationRequestParameters,
} from "@sam-monorepo/application";
import { redirect } from "next/navigation";
import {
  ASSUMED_USER_MESSAGE,
  CONSENT_UNAVAILABLE_MESSAGE,
  ConsentAvailability,
  getClientErrorMessage,
  getConsentAvailability,
} from "../utils/consent";
import { AuthorizationConsent } from "./AuthorizationConsent";
import { AuthorizationNotice } from "./AuthorizationNotice";

interface Props {
  readonly parameters: AuthorizationRequestParameters;
  /** The grant must belong to the user who gives the consent */
  readonly isAssumedUser: boolean;
  /** The handle or the name of the signed-in user */
  readonly userLabel: string;
}

/**
 * Validates the authorization request and asks for the consent. A request
 * with a valid client and redirect URI, but with other invalid parameters,
 * goes back to the client with the error (RFC 6749 section 4.1.2.1).
 */
export const AuthorizationRequest = async ({
  parameters,
  isAssumedUser,
  userLabel,
}: Props) => {
  if ((await getConsentAvailability()) !== ConsentAvailability.Available)
    return <AuthorizationNotice message={CONSENT_UNAVAILABLE_MESSAGE} />;

  if (isAssumedUser)
    return <AuthorizationNotice message={ASSUMED_USER_MESSAGE} />;

  const context = getApplicationContext();
  const validation = await validateAuthorizationRequest(context, parameters);

  switch (validation.kind) {
    case AuthorizationRequestValidationKind.Valid:
      return (
        <AuthorizationConsent validation={validation} userLabel={userLabel} />
      );

    case AuthorizationRequestValidationKind.ClientError:
      return (
        <AuthorizationNotice
          message={getClientErrorMessage(validation.reason)}
        />
      );

    case AuthorizationRequestValidationKind.RedirectError:
      return redirect(
        buildAuthorizationResponseUrl(context, validation.redirectUri, {
          error: validation.error,
          error_description: validation.description,
          state: validation.state,
        }),
      );

    default:
      throw new Error(`Unknown validation kind: ${validation satisfies never}`);
  }
};
