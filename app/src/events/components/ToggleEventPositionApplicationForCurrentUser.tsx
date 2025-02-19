"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/common/components/AlertDialog";
import Button from "@/common/components/Button";
import { VariantWithLogo } from "@/fleet/components/VariantWithLogo";
import type {
  EventPosition,
  Manufacturer,
  Series,
  Variant,
} from "@prisma/client";
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
    requiredVariant?: Variant & {
      series: Series & {
        manufacturer: Manufacturer;
      };
    };
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
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              disabled={isPending}
              className="flex items-center justify-center rounded uppercase gap-2 min-h-11 py-2 text-base font-bold bg-sinister-red-500 text-neutral-50 enabled:hover:bg-sinister-red-300 enabled:active:bg-sinister-red-300 px-6"
              title="Für diesen Posten Interesse anmelden"
            >
              Interesse anmelden
              {isPending ? <FaSpinner className="animate-spin" /> : <FaPlus />}
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Interesse anmelden?</AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div>
                  <p>
                    Du erfüllst nicht die Voraussetzungen für den Posten. Du
                    kannst trotzdem Interesse anmelden. Bitte bespreche mit dem
                    Organisator des Events, was du mitbringen sollst.
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
              </AlertDialogDescription>
            </AlertDialogHeader>

            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>

              <AlertDialogAction type="submit" form={formId}>
                Anmelden
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </form>
  );
};
