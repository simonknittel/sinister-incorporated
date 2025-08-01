"use client";

import Button from "@/common/components/Button";
import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import type {
  EventPosition,
  EventPositionRequiredVariant,
  Manufacturer,
  Series,
  Upload,
  Variant,
} from "@prisma/client";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { unstable_rethrow } from "next/navigation";
import { useId, useTransition } from "react";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaSpinner } from "react-icons/fa";
import { createEventPositionApplicationForCurrentUser } from "../actions/createEventPositionApplicationForCurrentUser";
import { deleteEventPositionApplicationForCurrentUser } from "../actions/deleteEventPositionApplicationForCurrentUser";

interface Props {
  readonly className?: string;
  readonly position: EventPosition & {
    requiredVariants: (EventPositionRequiredVariant & {
      variant: Variant & {
        series: Series & {
          manufacturer: Manufacturer & {
            image: Upload | null;
          };
        };
      };
    })[];
  };
  readonly hasCurrentUserAlreadyApplied?: boolean;
  readonly doesCurrentUserSatisfyRequirements?: boolean;
  readonly showDiscordWarning?: boolean;
}

export const ToggleEventPositionApplicationForCurrentUser = ({
  className,
  position,
  hasCurrentUserAlreadyApplied,
  doesCurrentUserSatisfyRequirements,
  showDiscordWarning,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = hasCurrentUserAlreadyApplied
          ? await deleteEventPositionApplicationForCurrentUser(formData)
          : await createEventPositionApplicationForCurrentUser(formData);

        if ("error" in response) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success);
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  return (
    <form action={formAction} id={formId} className={clsx(className)}>
      <input type="hidden" name="positionId" value={position.id} />

      {hasCurrentUserAlreadyApplied && (
        <Button
          type="submit"
          title="Abmelden"
          disabled={isPending}
          variant="primary"
        >
          Abmelden
          {isPending ? <FaSpinner className="animate-spin" /> : <FaMinus />}
        </Button>
      )}

      {!hasCurrentUserAlreadyApplied &&
        !showDiscordWarning &&
        doesCurrentUserSatisfyRequirements && (
          <Button
            type="submit"
            title="Für diesen Posten Interesse anmelden"
            disabled={isPending}
            variant="primary"
          >
            Interesse anmelden
            {isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
          </Button>
        )}

      {!hasCurrentUserAlreadyApplied &&
        !showDiscordWarning &&
        !doesCurrentUserSatisfyRequirements && (
          <Tooltip.Provider delayDuration={0}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Button
                  title="Für diesen Posten Interesse anmelden"
                  disabled={isPending}
                  variant="primary"
                >
                  Interesse anmelden
                  {isPending ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaPlus />
                  )}
                </Button>
              </Tooltip.Trigger>

              <Tooltip.Portal>
                <Tooltip.Content
                  className="p-4 max-w-[320px] select-none rounded-secondary bg-neutral-950 border border-sinister-red-500 text-white font-normal"
                  sideOffset={5}
                >
                  <div>
                    <p>
                      Du erfüllst nicht die Voraussetzungen für diesen Posten.
                      Du kannst trotzdem Interesse anmelden. Bespreche mit dem
                      Organisator, was du mitbringen sollst.
                    </p>

                    {position.requiredVariants.length > 0 && (
                      <>
                        <p className="text-sm text-gray-500 mt-4">
                          Erforderliches Schiff
                        </p>
                        {position.requiredVariants.map((requiredVariant) => (
                          <VariantWithLogo
                            key={requiredVariant.id}
                            variant={requiredVariant.variant}
                            manufacturer={
                              requiredVariant.variant.series.manufacturer
                            }
                            size={32}
                          />
                        ))}
                      </>
                    )}
                  </div>

                  <Tooltip.Arrow className="fill-sinister-red-500" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}

      {!hasCurrentUserAlreadyApplied && showDiscordWarning && (
        <Tooltip.Provider delayDuration={0}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Button
                title="Für diesen Posten Interesse anmelden"
                disabled={true}
                variant="primary"
              >
                Interesse anmelden
                <FaPlus />
              </Button>
            </Tooltip.Trigger>

            <Tooltip.Portal>
              <Tooltip.Content
                className="p-4 max-w-[320px] select-none rounded-secondary bg-neutral-950 border border-sinister-red-500 text-white font-normal"
                sideOffset={5}
              >
                <div>
                  <p>
                    Du musst dich erst in Discord bei diesem Event anmelden,
                    bevor du hier Interesse anmelden kannst.
                  </p>
                </div>

                <Tooltip.Arrow className="fill-sinister-red-500" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </form>
  );
};
