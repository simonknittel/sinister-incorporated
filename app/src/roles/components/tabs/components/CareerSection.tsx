import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import { Tooltip } from "@/common/components/Tooltip";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { usePermissionsContext } from "../../PermissionsContext";

type Props = Readonly<{
  className?: string;
}>;

export const CareerSection = ({ className }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Karriere</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-2 grid-rows-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Security lesen</h5>

            <Tooltip triggerChildren={<FaInfoCircle />}>
              Nutzer mit dieser Berechtigung können die Security-Karriereseite
              aufrufen. Sie können nur die Rollen und Zertifikate sehen, die für
              sie sichtbar sind.
            </Tooltip>
          </div>

          <YesNoCheckbox {...register("career;read;flowId=security")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Security bearbeiten</h5>

            <Tooltip triggerChildren={<FaInfoCircle />}>
              Nutzer mit dieser Berechtigung können die Darstellung der
              Security-Karriereseite bearbeiten. Hierzu werden sie alle Rollen
              und Zertifikate sehen können.
            </Tooltip>
          </div>

          <YesNoCheckbox {...register("career;update;flowId=security")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Economic lesen</h5>

            <Tooltip triggerChildren={<FaInfoCircle />}>
              Nutzer mit dieser Berechtigung können die Economic-Karriereseite
              aufrufen. Sie können nur die Rollen und Zertifikate sehen, die für
              sie sichtbar sind.
            </Tooltip>
          </div>

          <YesNoCheckbox {...register("career;read;flowId=economic")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Economic bearbeiten</h5>

            <Tooltip triggerChildren={<FaInfoCircle />}>
              Nutzer mit dieser Berechtigung können die Darstellung der
              Economic-Karriereseite bearbeiten. Hierzu werden sie alle Rollen
              und Zertifikate sehen können.
            </Tooltip>
          </div>

          <YesNoCheckbox {...register("career;update;flowId=economic")} />
        </div>
      </div>
    </div>
  );
};
