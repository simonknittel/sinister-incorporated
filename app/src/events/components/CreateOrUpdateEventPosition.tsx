"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import { Tooltip } from "@/common/components/Tooltip";
import type {
  Event,
  EventPosition,
  Manufacturer,
  Series,
  Variant,
} from "@prisma/client";
import clsx from "clsx";
import { flatten } from "lodash";
import { unstable_rethrow } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { FaInfoCircle, FaPen, FaPlus, FaSave, FaSpinner } from "react-icons/fa";
import { createEventPosition } from "../actions/createEventPosition";
import { updateEventPosition } from "../actions/updateEventPosition";

type BaseProps = Readonly<{
  className?: string;
  variants: (Manufacturer & {
    series: (Series & {
      variants: Variant[];
    })[];
  })[];
}>;

type CreateProps = Readonly<{
  eventId: Event["id"];
  parentPositionId?: EventPosition["id"] | null;
}>;

type UpdateProps = Readonly<{
  position?: EventPosition;
}>;

type Props = (CreateProps | UpdateProps) & BaseProps;

export const CreateOrUpdateEventPosition = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const nameInputId = useId();
  const descriptionInputId = useId();
  const variantIdInputId = useId();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsOpen(true);
  };

  const handleRequestClose = () => {
    setIsOpen(false);
  };

  const formAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        const response =
          "position" in props
            ? await updateEventPosition(formData)
            : await createEventPosition(formData);

        if (response.error) {
          toast.error(response.error);
          console.error(response);
          return;
        }

        toast.success(response.success!);
        if (formData.has("createAnother")) {
          nameInputRef.current?.focus();
          return;
        } else {
          setIsOpen(false);
        }
      } catch (error) {
        unstable_rethrow(error);
        toast.error(
          "Ein unbekannter Fehler ist aufgetreten. Bitte versuche es später erneut.",
        );
        console.error(error);
      }
    });
  };

  const variantOptions: {
    manufacturer: Manufacturer;
    variants: Variant[];
  }[] = props.variants
    .toSorted((a, b) => a.name.localeCompare(b.name))
    .map((manufacturer) => {
      return {
        manufacturer,
        variants: flatten(
          manufacturer.series
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((series) =>
              series.variants
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((variant) => variant),
            ),
        ),
      };
    });

  return (
    <>
      {"eventId" in props && !("parentPositionId" in props) && (
        <Button
          onClick={handleClick}
          variant="primary"
          className={clsx(props.className)}
          title="Posten oder Gruppe hinzufügen"
        >
          <span className="hidden md:inline">Hinzufügen</span>
          {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
        </Button>
      )}

      {"eventId" in props && "parentPositionId" in props && (
        <Button
          onClick={handleClick}
          variant="tertiary"
          className={clsx("px-2 w-auto", props.className)}
          title="Posten oder Gruppe hinzufügen"
          iconOnly
        >
          {isOpen ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaPlus className="text-lg" />
          )}
        </Button>
      )}

      {"position" in props && (
        <Button
          onClick={handleClick}
          variant="tertiary"
          className={clsx("px-2 w-auto", props.className)}
          title="Posten bearbeiten"
          iconOnly
        >
          {isOpen ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaPen className="text-lg" />
          )}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">
          Posten oder Gruppe {"position" in props ? "bearbeiten" : "hinzufügen"}
        </h2>

        <form action={formAction} className="mt-6">
          {"position" in props && props.position && (
            <input type="hidden" name="positionId" value={props.position.id} />
          )}
          {"eventId" in props && props.eventId && (
            <input type="hidden" name="eventId" value={props.eventId} />
          )}
          {"parentPositionId" in props && props.parentPositionId && (
            <input
              type="hidden"
              name="parentPositionId"
              value={props.parentPositionId}
            />
          )}

          <label className="block" htmlFor={nameInputId}>
            Name
          </label>
          <input
            autoFocus
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            name="name"
            required
            type="text"
            maxLength={256}
            defaultValue={("position" in props && props.position?.name) || ""}
            id={nameInputId}
            ref={nameInputRef}
          />

          <label className="block mt-4" htmlFor={descriptionInputId}>
            Beschreibung (optional)
          </label>
          <textarea
            className="p-2 rounded bg-neutral-900 w-full h-32 mt-2"
            name="description"
            maxLength={512}
            defaultValue={
              ("position" in props && props.position?.description) || ""
            }
            id={descriptionInputId}
          />

          <label
            className="flex gap-2 items-center mt-4"
            htmlFor={variantIdInputId}
          >
            Erforderliches Schiff (optional)
            <Tooltip triggerChildren={<FaInfoCircle />}>
              Für ein Multicrew-Schiff sollte das erforderliche Schiff nur bei
              einem Posten angegeben werden, bspw. für den Piloten.
              <br />
              <br />
              Bei den übrigen Posten, bspw. Turmschütze, sollte kein Schiff
              angegeben werden.
            </Tooltip>
          </label>
          <select
            name="variantId"
            id={variantIdInputId}
            className="p-2 rounded bg-neutral-900 w-full mt-2"
            defaultValue={
              ("position" in props && props.position?.requiredVariantId) || "-"
            }
          >
            <option value="-">-</option>

            {variantOptions.map((option) => (
              <optgroup
                key={option.manufacturer.id}
                label={option.manufacturer.name}
              >
                {option.variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          <div className="flex flex-col gap-2 mt-8">
            <Button type="submit" disabled={isPending}>
              {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>

            {"eventId" in props && (
              <Button
                type="submit"
                disabled={isPending}
                variant="tertiary"
                name="createAnother"
              >
                {isPending ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSave />
                )}
                Speichern und weiteren Posten erstellen
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};
