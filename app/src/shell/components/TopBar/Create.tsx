"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Button2 } from "@/common/components/Button2";
import {
  useCreateContext,
  type createForms,
} from "@/common/components/CreateContext";
import { Link } from "@/common/components/Link";
import * as RadixPopover from "@radix-ui/react-popover";
import clsx from "clsx";
import { useState } from "react";
import { FaPlus } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const Create = ({ className }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const authentication = useAuthentication();
  const { openCreateModal } = useCreateContext();

  const handleClick = (modalId: keyof typeof createForms) => {
    openCreateModal(modalId);
    setIsOpen(false);
  };

  const showCreateCitizen =
    authentication && authentication.authorize("citizen", "create");
  const showCreateOrganization =
    authentication && authentication.authorize("organization", "create");
  const showCreateRole =
    authentication && authentication.authorize("role", "manage");
  const showCreatePenaltyEntry =
    authentication && authentication.authorize("penaltyEntry", "create");
  const showCreateTask =
    authentication && authentication.authorize("task", "create");

  if (
    !showCreateCitizen &&
    !showCreateOrganization &&
    !showCreateRole &&
    !showCreatePenaltyEntry &&
    !showCreateTask
  )
    return null;

  return (
    <div className={clsx("h-full p-2", className)}>
      <RadixPopover.Root open={isOpen} onOpenChange={setIsOpen}>
        <RadixPopover.Trigger asChild>
          <Button2
            variant="secondary"
            colorSchema="interactionMuted"
            className="h-full px-6"
          >
            <FaPlus />
            Neu
          </Button2>
        </RadixPopover.Trigger>

        <RadixPopover.Portal>
          <RadixPopover.Content
            collisionPadding={{ left: 24, right: 24 }}
            className="z-10 rounded-secondary overflow-hidden"
          >
            <div className="flex flex-col gap-[1px]">
              {showCreateCitizen && (
                <Button2
                  onClick={() => handleClick("citizen")}
                  className="px-3 !justify-start rounded-none"
                >
                  <FaPlus />
                  Citizen
                </Button2>
              )}

              {showCreateOrganization && (
                <Button2
                  onClick={() => handleClick("organization")}
                  className="px-3 !justify-start rounded-none"
                >
                  <FaPlus />
                  Organisation
                </Button2>
              )}

              {showCreateRole && (
                <Button2
                  onClick={() => handleClick("role")}
                  className="px-3 !justify-start rounded-none"
                >
                  <FaPlus />
                  Rolle
                </Button2>
              )}

              <Button2
                as={Link}
                onClick={() => setIsOpen(false)}
                href="/app/silo-request"
                className="px-3 !justify-start rounded-none"
              >
                <FaPlus />
                SILO-Anfrage
              </Button2>

              {showCreatePenaltyEntry && (
                <Button2
                  onClick={() => handleClick("penaltyEntry")}
                  className="px-3 !justify-start rounded-none"
                >
                  <FaPlus />
                  Strafpunkte
                </Button2>
              )}

              {showCreateTask && (
                <Button2
                  onClick={() => handleClick("task")}
                  className="px-3 !justify-start rounded-none"
                >
                  <FaPlus />
                  Task
                </Button2>
              )}
            </div>

            <RadixPopover.Arrow className="fill-sinister-red-500" />
          </RadixPopover.Content>
        </RadixPopover.Portal>
      </RadixPopover.Root>
    </div>
  );
};
