import Button from "@/common/components/Button";
import YesNoCheckbox from "@/common/components/YesNoCheckbox";
import * as Tooltip from "@radix-ui/react-tooltip";
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

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-2 grid-rows-1 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Lesen</h5>

            <div className="relative z-10">
              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button variant="tertiary" type="button">
                      <FaInfoCircle />
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Content
                    className="p-4 text-sm leading-tight max-w-[640px] select-none rounded bg-neutral-600 shadow-sm"
                    sideOffset={5}
                  >
                    <p>
                      Nutzer mit dieser Berechtigung können die Karriereseite
                      aufrufen. Sie können nur die Rollen und Zertifikate sehen,
                      die für sie sichtbar sind.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("career;read")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Bearbeiten</h5>

            <div className="relative z-10">
              <Tooltip.Provider delayDuration={300}>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button variant="tertiary" type="button">
                      <FaInfoCircle />
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Content
                    className="p-4 text-sm leading-tight max-w-[640px] select-none rounded bg-neutral-600 shadow-sm"
                    sideOffset={5}
                  >
                    <p>
                      Nutzer mit dieser Berechtigung können die Darstellung der
                      Karriereseite bearbeiten. Hierzu werden sie alle Rollen
                      und Zertifikate sehen können.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("career;update")} />
        </div>
      </div>
    </div>
  );
};