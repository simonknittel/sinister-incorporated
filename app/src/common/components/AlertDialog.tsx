"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import clsx from "clsx";
import type { ComponentProps, HTMLAttributes } from "react";

export const AlertDialog = AlertDialogPrimitive.Root;

export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps = ComponentProps<
  typeof AlertDialogPrimitive.Overlay
>;

export const AlertDialogOverlay = ({
  className,
  ...props
}: AlertDialogOverlayProps) => (
  <AlertDialogPrimitive.Overlay
    className={clsx(
      "fixed inset-0 z-50 bg-neutral-800/50 backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
);

type AlertDialogContentProps = ComponentProps<
  typeof AlertDialogPrimitive.Content
>;

export const AlertDialogContent = ({
  className,
  ...props
}: AlertDialogContentProps) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      className={clsx(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-2xl bg-neutral-800 text-neutral-50",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
);

type AlertDialogHeaderProps = HTMLAttributes<HTMLDivElement>;

export const AlertDialogHeader = ({
  className,
  ...props
}: AlertDialogHeaderProps) => (
  <div
    className={clsx(
      "flex flex-col space-y-2 text-center sm:text-left",
      className,
    )}
    {...props}
  />
);

type AlertDialogFooterProps = HTMLAttributes<HTMLDivElement>;

export const AlertDialogFooter = ({
  className,
  ...props
}: AlertDialogFooterProps) => (
  <div
    className={clsx(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);

type AlertDialogContentChildrenProps = ComponentProps<
  typeof AlertDialogPrimitive.Content
>;

export const AlertDialogTitle = ({
  className,
  ...props
}: AlertDialogContentChildrenProps) => (
  <AlertDialogPrimitive.Title
    className={clsx("text-lg font-semibold", className)}
    {...props}
  />
);

type AlertDialogDescriptionProps = ComponentProps<
  typeof AlertDialogPrimitive.Description
>;

export const AlertDialogDescription = ({
  className,
  ...props
}: AlertDialogDescriptionProps) => (
  <AlertDialogPrimitive.Description
    className={clsx("text-sm text-muted-foreground", className)}
    {...props}
  />
);

type AlertDialogActionProps = ComponentProps<
  typeof AlertDialogPrimitive.Action
>;

export const AlertDialogAction = ({
  className,
  ...props
}: AlertDialogActionProps) => (
  <AlertDialogPrimitive.Action className={clsx(className)} {...props} />
);

type AlertDialogCancelProps = ComponentProps<
  typeof AlertDialogPrimitive.Cancel
>;

export const AlertDialogCancel = ({
  className,
  ...props
}: AlertDialogCancelProps) => (
  <AlertDialogPrimitive.Cancel
    className={clsx("mt-2 sm:mt-0", className)}
    {...props}
  />
);
