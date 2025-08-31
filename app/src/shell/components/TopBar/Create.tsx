"use client";

import { useAuthentication } from "@/auth/hooks/useAuthentication";
import { Button2 } from "@/common/components/Button2";
import {
  useCreateContext,
  type createForms,
} from "@/common/components/CreateContext";
import { Link } from "@/common/components/Link";
import { Popover, usePopover } from "@/common/components/Popover";
import clsx from "clsx";
import { FaPlus } from "react-icons/fa";

interface Props {
  readonly className?: string;
}

export const Create = ({ className }: Props) => {
  const authentication = useAuthentication();

  const showCreateCitizen = Boolean(
    authentication && authentication.authorize("citizen", "create"),
  );
  const showCreateOrganization = Boolean(
    authentication && authentication.authorize("organization", "create"),
  );
  const showCreateRole = Boolean(
    authentication && authentication.authorize("role", "manage"),
  );
  const showCreatePenaltyEntry = Boolean(
    authentication && authentication.authorize("penaltyEntry", "create"),
  );
  const showCreateTask = Boolean(
    authentication && authentication.authorize("task", "create"),
  );

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
      <Popover
        trigger={
          <Button2
            variant="secondary"
            colorSchema="interactionMuted"
            className="h-full px-6"
          >
            <FaPlus />
            Neu
          </Button2>
        }
        childrenClassName="flex flex-col gap-[1px] w-48"
        enableHover
      >
        <PopoverChildren
          showCreateCitizen={showCreateCitizen}
          showCreateOrganization={showCreateOrganization}
          showCreateRole={showCreateRole}
          showCreatePenaltyEntry={showCreatePenaltyEntry}
          showCreateTask={showCreateTask}
        />
      </Popover>
    </div>
  );
};

interface PopoverChildrenProps {
  readonly showCreateCitizen: boolean;
  readonly showCreateOrganization: boolean;
  readonly showCreateRole: boolean;
  readonly showCreatePenaltyEntry: boolean;
  readonly showCreateTask: boolean;
}

const PopoverChildren = ({
  showCreateCitizen,
  showCreateOrganization,
  showCreateRole,
  showCreatePenaltyEntry,
  showCreateTask,
}: PopoverChildrenProps) => {
  const { closePopover } = usePopover();
  const { openCreateModal } = useCreateContext();

  const handleClick = (modalId: keyof typeof createForms) => {
    openCreateModal(modalId);
    closePopover();
  };

  return (
    <>
      {showCreateCitizen && (
        <button
          onClick={() => handleClick("citizen")}
          className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
        >
          Citizen
        </button>
      )}

      {showCreateOrganization && (
        <button
          onClick={() => handleClick("organization")}
          className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
        >
          Organisation
        </button>
      )}

      {showCreateRole && (
        <button
          onClick={() => handleClick("role")}
          className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
        >
          Rolle
        </button>
      )}

      <Link
        onClick={() => closePopover()}
        href="/app/silo-request"
        className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
      >
        SILO-Anfrage
      </Link>

      {showCreatePenaltyEntry && (
        <button
          onClick={() => handleClick("penaltyEntry")}
          className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
        >
          Strafpunkte
        </button>
      )}

      {showCreateTask && (
        <button
          onClick={() => handleClick("task")}
          className="block hover:outline-interaction-700 focus-visible:outline-interaction-700 active:outline-interaction-500 outline outline-offset-4 outline-1 outline-transparent transition-colors rounded-primary overflow-hidden background-secondary group p-2 text-xs text-left"
        >
          Task
        </button>
      )}
    </>
  );
};
