import Button from "@/common/components/Button";
import YesNoCheckbox from "@/common/components/form/YesNoCheckbox";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { FaInfoCircle } from "react-icons/fa";
import { usePermissionsContext } from "../../PermissionsContext";

type Props = Readonly<{
  className?: string;
}>;

export const OrganizationMembershipSection = ({ className }: Props) => {
  const { register } = usePermissionsContext();

  return (
    <div className={clsx(className)}>
      <h4 className="font-bold">Mitglieder</h4>

      <div className="border border-neutral-700 p-4 rounded mt-2 grid grid-cols-3 grid-rows-2 gap-4">
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
                      Nutzer mit dieser Berechtigung können
                      Organisationsmitglieder sehen, die ihre Sichtbarkeit auf
                      &quot;Visible&quot; gesetzt haben.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("organizationMembership;read")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Lesen (Redacted)</h5>

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
                      Nutzer mit dieser Berechtigung können
                      Organisationsmitglieder sehen, die ihre Sichtbarkeit auf
                      &quot;Redacted&quot; gesetzt haben.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox
            {...register(
              "organizationMembership;read;alsoVisibilityRedacted=true",
            )}
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Erstellen</h5>

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
                      Nutzer mit dieser Berechtigung können Citizen einer
                      Organisation hinzufügen. Dies Mitgliedschaften gelten erst
                      mal als unbestätigt.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("organizationMembership;create")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Löschen</h5>

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
                      Nutzer mit dieser Berechtigung können Citizen aus einer
                      Organisation entfernen.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("organizationMembership;delete")} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h5 className="font-bold">Bestätigen</h5>

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
                      Nutzer mit dieser Berechtigung können die Mitgliedschaft
                      eines Citizen in einer Organisation bestätigen.
                    </p>
                    <Tooltip.Arrow className="fill-neutral-600" />
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </div>
          </div>

          <YesNoCheckbox {...register("organizationMembership;confirm")} />
        </div>
      </div>
    </div>
  );
};
