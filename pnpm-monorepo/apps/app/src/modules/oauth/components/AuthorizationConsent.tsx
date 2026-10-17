import { Button2Variant } from "@/modules/common/components/Button2";
import Note from "@/modules/common/components/Note";
import { Tile } from "@/modules/common/components/Tile";
import type {
  AuthorizationRequestValidation,
  AuthorizationRequestValidationKind,
} from "@sam-monorepo/application";
import { FaCheck, FaTimes } from "react-icons/fa";
import { approveAuthorization } from "../actions/approveAuthorization";
import { denyAuthorization } from "../actions/denyAuthorization";
import { toConsentFormParameters } from "../utils/consent";
import { ConsentDecisionForm } from "./ConsentDecisionForm";

interface Props {
  readonly validation: Extract<
    AuthorizationRequestValidation,
    { kind: AuthorizationRequestValidationKind.Valid }
  >;
  /** The handle or the name of the signed-in user */
  readonly userLabel: string;
}

/** The host, or the scheme of a native app without a host */
const getRedirectTarget = (redirectUri: string) => {
  const url = new URL(redirectUri);

  return url.host || url.protocol;
};

/**
 * Asks the user to connect a client. The host of the client id is the only
 * trusted identity of the client: the client gives its name itself.
 */
export const AuthorizationConsent = ({ validation, userLabel }: Props) => {
  const parameters = toConsentFormParameters(validation);

  return (
    <Tile heading="Zugriff erlauben" childrenClassName="flex flex-col gap-4">
      <div>
        <p className="text-sm text-neutral-500">
          Diese Anwendung möchte auf SAM zugreifen:
        </p>
        <p className="text-2xl font-bold break-all">
          {new URL(validation.client.clientId).host}
        </p>
        <p className="mt-1 break-words">
          Name laut Anwendung: {validation.client.clientName}
        </p>
        <p className="text-xs text-neutral-500">
          Die Anwendung gibt ihren Namen selbst an. Prüfe die Adresse darüber.
        </p>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-neutral-500">Angemeldet als</dt>
        <dd className="break-all">{userLabel}</dd>

        <dt className="text-neutral-500">Weiterleitung an</dt>
        <dd className="break-all">
          {getRedirectTarget(validation.redirectUri)}
        </dd>

        <dt className="text-neutral-500">Zugriff</dt>
        <dd>Zugriff auf SAM mit deinen Berechtigungen</dd>
      </dl>

      {validation.isLoopbackRedirectUri && (
        <Note
          type="warning"
          message="Die Anwendung läuft auf diesem Computer. Erlaube den Zugriff nur, wenn du die Anwendung gerade selbst gestartet hast."
        />
      )}

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
    </Tile>
  );
};
