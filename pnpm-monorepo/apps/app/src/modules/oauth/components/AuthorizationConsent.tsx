import { Button2Variant } from "@/modules/common/components/Button2";
import { Tile } from "@/modules/common/components/Tile";
import type {
  AuthorizationRequestValidation,
  AuthorizationRequestValidationKind,
} from "@sam-monorepo/application";
import { FaCheck, FaTimes } from "react-icons/fa";
import { approveAuthorization } from "../actions/approveAuthorization";
import { denyAuthorization } from "../actions/denyAuthorization";
import { getRedirectTarget, toConsentFormParameters } from "../utils/consent";
import { ConsentDecisionForm } from "./ConsentDecisionForm";

interface Props {
  readonly validation: Extract<
    AuthorizationRequestValidation,
    { kind: AuthorizationRequestValidationKind.Valid }
  >;
}

/**
 * Asks the user to connect a client. The host of the client id is the only
 * trusted identity of the client: the client gives its name itself.
 */
export const AuthorizationConsent = ({ validation }: Props) => {
  const parameters = toConsentFormParameters(validation);

  return (
    <Tile heading="Zugriff erlauben" childrenClassName="flex flex-col gap-4">
      <div>
        <p className="text-sm text-neutral-500">
          Diese Anwendung möchte in deinem Namen auf SAM zugreifen:
        </p>
        <p className="mt-1 text-2xl font-bold wrap-break-word">
          {validation.client.clientName}
        </p>
        <p className="break-all">{new URL(validation.client.clientId).host}</p>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <ConsentDecisionForm
          action={denyAuthorization}
          parameters={parameters}
          variant={Button2Variant.Secondary}
          icon={<FaTimes />}
        >
          Ablehnen
        </ConsentDecisionForm>

        <ConsentDecisionForm
          action={approveAuthorization}
          parameters={parameters}
          icon={<FaCheck />}
        >
          Erlauben
        </ConsentDecisionForm>
      </div>

      <p className="text-right text-sm break-all text-neutral-500">
        Du wirst weitergeleitet zu {getRedirectTarget(validation.redirectUri)}
      </p>
    </Tile>
  );
};
