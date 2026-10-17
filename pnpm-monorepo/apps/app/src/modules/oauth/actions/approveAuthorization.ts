"use server";

import { createAuthenticatedAction } from "@/modules/actions/utils/createAction";
import {
  getApplicationContext,
  mapApplicationErrorToActionResponse,
  toActor,
} from "@/modules/application";
import {
  AuthorizationRequestValidationKind,
  buildAuthorizationResponseUrl,
  createGrantWithAuthorizationCode,
  validateAuthorizationRequest,
} from "@sam-monorepo/application";
import { redirect } from "next/navigation";
import {
  ASSUMED_USER_MESSAGE,
  CONSENT_UNAVAILABLE_MESSAGE,
  ConsentAvailability,
  consentFormSchema,
  getClientErrorMessage,
  getConsentAvailability,
} from "../utils/consent";

/**
 * Records the consent and sends the browser back to the client with the
 * authorization code. The action validates the request again: the form
 * fields come from the browser.
 */
export const approveAuthorization = createAuthenticatedAction(
  "approveAuthorization",
  consentFormSchema,
  async (formData, authentication, data, t) => {
    // The grant must belong to the user who gives the consent
    if (authentication.session.assumedByAdminId)
      return { error: ASSUMED_USER_MESSAGE, requestPayload: formData };

    if ((await getConsentAvailability()) !== ConsentAvailability.Available)
      return { error: CONSENT_UNAVAILABLE_MESSAGE, requestPayload: formData };

    const context = getApplicationContext();
    const validation = await validateAuthorizationRequest(context, data);

    switch (validation.kind) {
      case AuthorizationRequestValidationKind.Valid: {
        let code: string;
        try {
          ({ code } = await createGrantWithAuthorizationCode(
            context,
            await toActor(authentication.session),
            validation,
          ));
        } catch (error) {
          return mapApplicationErrorToActionResponse(error, { formData, t });
        }

        return redirect(
          buildAuthorizationResponseUrl(context, validation.redirectUri, {
            code,
            state: validation.state,
          }),
        );
      }

      case AuthorizationRequestValidationKind.ClientError:
        return {
          error: getClientErrorMessage(validation.reason),
          requestPayload: formData,
        };

      case AuthorizationRequestValidationKind.RedirectError:
        return redirect(
          buildAuthorizationResponseUrl(context, validation.redirectUri, {
            error: validation.error,
            error_description: validation.description,
            state: validation.state,
          }),
        );

      default:
        throw new Error(
          `Unknown validation kind: ${validation satisfies never}`,
        );
    }
  },
);
