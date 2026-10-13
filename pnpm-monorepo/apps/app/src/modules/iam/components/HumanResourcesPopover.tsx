"use client";

import { PopoverBaseUI } from "@/modules/common/components/PopoverBaseUI";
import type { HumanResourcesContact } from "../queries/getHumanResourcesContacts";

interface Props {
  readonly contacts: readonly HumanResourcesContact[];
}

/**
 * Shows on the clearance page, which renders outside of the app shell. Thus
 * it must not use the contexts of the app shell (roles, session, tRPC).
 */
export const HumanResourcesPopover = ({ contacts }: Props) => {
  return (
    <PopoverBaseUI
      title="Human Resources"
      trigger="Human Resources"
      triggerClassName="cursor-pointer underline decoration-dotted underline-offset-4 hover:text-interaction-500 focus-visible:text-interaction-500 active:text-interaction-300"
    >
      <p className="text-sm text-neutral-400">
        Wende dich an eine dieser Personen:
      </p>

      <ul className="mt-2">
        {contacts.map((contact) => (
          <li key={contact.id}>{contact.handle}</li>
        ))}
      </ul>
    </PopoverBaseUI>
  );
};
