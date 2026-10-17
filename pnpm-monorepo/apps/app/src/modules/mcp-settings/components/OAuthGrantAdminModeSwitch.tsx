"use client";

import { useAction } from "@/modules/actions/utils/useAction";
import {
  AlertDialog,
  useSubmitConfirmation,
} from "@/modules/common/components/AlertDialog";
import YesNoCheckbox from "@/modules/common/components/form/YesNoCheckbox";
import clsx from "clsx";
import { useRef } from "react";
import { updateOAuthGrantAdminMode } from "../actions/updateOAuthGrantAdminMode";

interface Props {
  readonly className?: string;
  readonly grantId: string;
  readonly clientHost: string;
  readonly isEnabled: boolean;
}

export const OAuthGrantAdminModeSwitch = ({
  className,
  grantId,
  clientHost,
  isEnabled,
}: Props) => {
  const formRef = useRef<HTMLFormElement>(null);
  const { formAction, isPending } = useAction(updateOAuthGrantAdminMode);
  // Only the enabling gives the client more permissions
  const confirmation = useSubmitConfirmation(!isEnabled);

  return (
    /**
     * `relative`: the input of the checkbox has an absolute position. Without
     * a positioned ancestor in the scroll container of the table, the input
     * makes the page wider on small screens.
     */
    <div className={clsx("relative flex items-center", className)}>
      {/**
       * The checkbox is not in the form: React resets a form after its
       * action, and the checkbox must show the state of the server
       */}
      <form ref={formRef} action={formAction} onSubmit={confirmation.onSubmit}>
        <input type="hidden" name="grantId" value={grantId} />
        <input type="hidden" name="enabled" value={String(!isEnabled)} />

        <AlertDialog
          isOpen={confirmation.isOpen}
          onClose={confirmation.close}
          title="Admin-Modus aktivieren?"
          description={
            <>
              <span className="font-bold break-all">{clientHost}</span> bekommt
              alle Berechtigungen in SAM, wie mit dem Admin-Modus in der
              Toolbar. Aktiviere ihn nur für einen Client, dem du vertraust.
            </>
          }
          confirmLabel="Aktivieren"
        />
      </form>

      <YesNoCheckbox
        hideLabel
        aria-label={`Admin-Modus für ${clientHost}`}
        checked={isEnabled}
        disabled={isPending}
        onChange={() => formRef.current?.requestSubmit()}
      />
    </div>
  );
};
