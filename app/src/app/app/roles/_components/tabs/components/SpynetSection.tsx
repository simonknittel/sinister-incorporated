import Button from "@/common/components/Button";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { usePermissionsContext } from "../../PermissionsContext";

type Props = Readonly<{
  className?: string;
}>;

export const SpynetSection = ({ className }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Spynet</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-4 grid-rows-1 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Aktivität</h5>

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
                      Ermöglicht das Aufrufen der Aktivität-Seite im Spynet.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("spynetActivity;read")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Citizen</h5>

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
                    <p>Ermöglicht das Aufrufen der Citizen-Seite im Spynet.</p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("spynetCitizen;read")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Notizen</h5>

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
                    <p>Ermöglicht das Aufrufen der Notizen-Seite im Spynet.</p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("spynetNotes;read")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Sonstige</h5>

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
                    <p>Ermöglicht das Aufrufen der Sonstige-Seite im Spynet.</p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("spynetOther;read")} />
        </div>
      </div>
    </div>
  );
};
