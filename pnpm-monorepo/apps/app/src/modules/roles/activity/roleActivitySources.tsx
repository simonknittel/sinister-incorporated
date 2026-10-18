import type { ActivitySource } from "@/modules/activity/utils/activityEntry";
import type { ActivityFilters } from "@/modules/activity/utils/activityFilterParams";
import { getApplicationContext, getRequestActor } from "@/modules/application";
import { CitizenLink } from "@/modules/common/components/CitizenLink";
import { withTrace } from "@/modules/tracing/utils/withTrace";
import {
  findRoleAssignmentChanges,
  findRoleAssignmentLevelChanges,
  type RoleAssignmentHistoryInput,
} from "@sam-monorepo/application";
import {
  RoleAssignmentChangeType,
  RoleAssignmentLevelChangeType,
  type Citizen,
} from "@sam-monorepo/database/client";
import type { MergedCursorSourceInput } from "@sam-monorepo/domain";
import { SingleRoleBadge } from "../components/SingleRoleBadge";
import { RoleActivitySourceKey } from "./roleActivityTypes";

interface Input {
  /** Restricts the source to one citizen's history. */
  readonly citizenId?: Citizen["id"];
  /** Whether the citizen the entry is about gets its own column. */
  readonly withTarget?: boolean;
  readonly filters?: ActivityFilters;
}

const toHistoryInput = (
  { citizenId, filters }: Input,
  sourceKey: RoleActivitySourceKey,
  sourceInput: MergedCursorSourceInput,
): RoleAssignmentHistoryInput => ({
  ...sourceInput,
  sourceKey,
  citizenId,
  actorIds: filters?.actorIds,
  createdAt: filters?.createdAt,
});

export const createRoleAssignmentSource = (input: Input = {}): ActivitySource =>
  withTrace(
    "roleAssignmentActivitySource",
    async (sourceInput: MergedCursorSourceInput) => {
      const changes = await findRoleAssignmentChanges(
        getApplicationContext(),
        await getRequestActor(),
        toHistoryInput(input, RoleActivitySourceKey.Assignment, sourceInput),
      );

      return changes.map((change) => ({
        sourceKey: RoleActivitySourceKey.Assignment,
        id: change.id,
        date: change.createdAt,
        actor: change.createdBy,
        target: input.withTarget ? (
          <CitizenLink citizen={change.citizen} />
        ) : undefined,
        message: buildAssignmentMessage(change.type, change.roleId),
      }));
    },
  );

export const createRoleAssignmentLevelSource = (
  input: Input = {},
): ActivitySource =>
  withTrace(
    "roleAssignmentLevelActivitySource",
    async (sourceInput: MergedCursorSourceInput) => {
      const changes = await findRoleAssignmentLevelChanges(
        getApplicationContext(),
        await getRequestActor(),
        toHistoryInput(
          input,
          RoleActivitySourceKey.AssignmentLevel,
          sourceInput,
        ),
      );

      return changes.map((change) => ({
        sourceKey: RoleActivitySourceKey.AssignmentLevel,
        id: change.id,
        date: change.createdAt,
        actor: change.createdBy,
        target: input.withTarget ? (
          <CitizenLink citizen={change.citizen} />
        ) : undefined,
        message: buildLevelMessage(change.type, change.roleId),
      }));
    },
  );

const buildAssignmentMessage = (
  type: RoleAssignmentChangeType,
  roleId: string,
) => {
  switch (type) {
    case RoleAssignmentChangeType.ADD:
      return (
        <>
          Rolle <SingleRoleBadge roleId={roleId} /> hinzugefügt
        </>
      );

    case RoleAssignmentChangeType.REMOVE:
      return (
        <>
          Rolle <SingleRoleBadge roleId={roleId} /> entfernt
        </>
      );

    default:
      throw new Error(`Unknown change type: ${type satisfies never}`);
  }
};

const buildLevelMessage = (
  type: RoleAssignmentLevelChangeType,
  roleId: string,
) => {
  switch (type) {
    case RoleAssignmentLevelChangeType.UP:
      return (
        <>
          Level der Rolle <SingleRoleBadge roleId={roleId} /> erhöht
        </>
      );

    case RoleAssignmentLevelChangeType.DOWN:
      return (
        <>
          Level der Rolle <SingleRoleBadge roleId={roleId} /> verringert
        </>
      );

    default:
      throw new Error(`Unknown change type: ${type satisfies never}`);
  }
};
