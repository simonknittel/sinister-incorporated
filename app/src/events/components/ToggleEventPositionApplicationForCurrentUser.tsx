"use client";

import Button from "@/common/components/Button";
import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import type {
  EventPosition,
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

type Props = Readonly<{
  className?: string;
  position: EventPosition & {
    requiredVariant:
      | (Variant & {
          series: Series & {
            manufacturer: Manufacturer & {
              image: Upload | null;
            };
          };
        })
      | null;
  };
  hasCurrentUserAlreadyApplied?: boolean;
  doesCurrentUserSatisfyRequirements?: boolean;
}>;

export const ToggleEventPositionApplicationForCurrentUser = ({
  className,
  position,
  hasCurrentUserAlreadyApplied,
  doesCurrentUserSatisfyRequirements,
}: Props) => {
  const [isPending, startTransition] = useTransition();
  const formId = useId();

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response = hasCurrentUserAlreadyApplied
          ? await deleteEventPositionApplicationForCurrentUser(formData)
          : await createEventPositionApplicationForCurrentUser(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success!);
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

      {hasCurrentUserAlreadyApplied ? (
        <Button
          type="submit"
          title="Abmelden"
          disabled={isPending}
          variant="primary"
        >
          Abmelden
          {isPending ? <FaSpinner className="animate-spin" /> : <FaMinus />}
        </Button>
      ) : doesCurrentUserSatisfyRequirements ? (
        <Button
          type="submit"
          title="Für diesen Posten Interesse anmelden"
          disabled={isPending}
          variant="primary"
        >
          Interesse anmelden
          {isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
        </Button>
      ) : (
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

            <Tooltip.Content
              className="p-4 max-w-[320px] select-none rounded bg-neutral-950 border border-sinister-red-500 text-white font-normal"
              sideOffset={5}
            >
              <div>
                <p>
                  Du erfüllst nicht die Voraussetzungen für diesen Posten. Du
                  kannst trotzdem Interesse anmelden. Bespreche mit dem
                  Organisator, was du mitbringen sollst.
                </p>

                {position.requiredVariant && (
                  <>
                    <p className="text-sm text-gray-500 mt-4">
                      Erforderliches Schiff
                    </p>
                    <VariantWithLogo
                      variant={position.requiredVariant}
                      manufacturer={
                        position.requiredVariant.series.manufacturer
                      }
                      size={32}
                    />
                  </>
                )}
              </div>
              <Tooltip.Arrow className="fill-sinister-red-500" />
            </Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </form>
  );
};
