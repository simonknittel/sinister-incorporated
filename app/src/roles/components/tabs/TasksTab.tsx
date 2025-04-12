"use client";

import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import TabPanel from "@/common/components/tabs/TabPanel";
import { TaskRewardType, TaskVisibility } from "@prisma/client";
import { usePermissionsContext } from "../PermissionsContext";

export const TasksTab = () => {
  const { register } = usePermissionsContext();

  return (
    <TabPanel id="tasks">
      <div className="border rounded border-neutral-700 p-4">
        <h4 className="font-bold text-xl">Task einsehen</h4>
        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Öffentlich oder personalisiert</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können öffentliche Tasks einsehen
              sowie personalisierte Tasks, die ihnen zugewiesen sind.
            </p>
          </div>

          <YesNoCheckbox {...register("task;read")} />
        </div>

        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Gelöscht</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können gelöschte Tasks einsehen.
            </p>
          </div>

          <YesNoCheckbox {...register("task;read;taskDeleted=1")} />
        </div>
      </div>

      <div className="border rounded border-neutral-700 p-4 mt-4">
        <h4 className="font-bold text-xl">Task erstellen</h4>

        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Öffentlich</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können einen öffentlichen Task
              erstellen, welcher von allen eingesehen und angenommen werden
              kann.
            </p>
          </div>

          <YesNoCheckbox
            {...register(
              `task;create;taskVisibility=${TaskVisibility.PUBLIC};taskRewardType=other`,
            )}
          />
        </div>

        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Öffentlich mit neuen SILC</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können einen öffentlichen Task
              erstellen, welcher neue SILC als Belohnung hat.
            </p>
          </div>

          <YesNoCheckbox
            {...register(
              `task;create;taskVisibility=${TaskVisibility.PUBLIC};taskRewardType=${TaskRewardType.NEW_SILC}`,
            )}
          />
        </div>

        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Personalisiert</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können einen personalisierten Task
              erstellen, der einem Citizen zugewiesen ist.
            </p>
          </div>

          <YesNoCheckbox
            {...register(
              `task;create;taskVisibility=${TaskVisibility.PERSONALIZED};taskRewardType=other`,
            )}
          />
        </div>

        <div className="py-2 flex justify-between items-center gap-2 mt-2">
          <div>
            <h4 className="font-bold">Personalisiert mit neuen SILC</h4>
            <p className="text-sm text-neutral-400">
              Citizen mit dieser Berechtigung können einen personalisierten Task
              erstellen, welcher neue SILC als Belohnung hat.
            </p>
          </div>

          <YesNoCheckbox
            {...register(
              `task;create;taskVisibility=${TaskVisibility.PERSONALIZED};taskRewardType=${TaskRewardType.NEW_SILC}`,
            )}
          />
        </div>
      </div>

      <div className="py-2 flex justify-between items-center gap-2 mt-2">
        <div>
          <h4 className="font-bold">Tasks verwalten</h4>
          <p className="text-sm text-neutral-400">
            Citizen mit dieser Berechtigung können alle Arten von Tasks
            einsehen, erstellen und bearbeiten.
          </p>
        </div>

        <YesNoCheckbox {...register("task;manage")} />
      </div>
    </TabPanel>
  );
};
