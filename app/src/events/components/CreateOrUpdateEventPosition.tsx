"use client";

import Button from "@/common/components/Button";
import Modal from "@/common/components/Modal";
import type {
  DiscordEvent,
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
import { FaPen, FaPlus, FaSave, FaSpinner } from "react-icons/fa";
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
  event: DiscordEvent;
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

        toast.success(response.success);
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
      {"event" in props && (
        <Button
          onClick={handleClick}
          variant="secondary"
          className={clsx(props.className)}
          title="Posten hinzufügen"
        >
          <span className="hidden md:inline">Posten hinzufügen</span>
          {isOpen ? <FaSpinner className="animate-spin" /> : <FaPlus />}
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
          {isOpen ? <FaSpinner className="animate-spin" /> : <FaPen />}
        </Button>
      )}

      <Modal
        isOpen={isOpen}
        onRequestClose={handleRequestClose}
        className="w-[480px]"
      >
        <h2 className="text-xl font-bold">
          Posten {"position" in props ? "bearbeiten" : "hinzufügen"}
        </h2>

        <form action={formAction} className="mt-6">
          {"position" in props && props.position && (
            <input type="hidden" name="positionId" value={props.position.id} />
          )}
          {"event" in props && props.event && (
            <input type="hidden" name="eventId" value={props.event.id} />
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

          <label className="block mt-4" htmlFor={variantIdInputId}>
            Erforderliches Schiff (optional)
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

          {/* TODO: Add input for selecting multiple roles */}

          <div className="flex flex-col gap-2 mt-8">
            <Button type="submit" disabled={isPending}>
              {isPending ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Speichern
            </Button>

            {"event" in props && (
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
