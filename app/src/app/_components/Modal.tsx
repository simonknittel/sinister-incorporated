"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface Props {
  className?: string;
  isOpen?: boolean | null;
  onRequestClose?: () => void;
  children?: ReactNode;
}

export default function Modal({
  className,
  isOpen = false,
  children,
  onRequestClose,
}: Props) {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex cursor-pointer items-center justify-center bg-neutral-900 bg-opacity-80 p-2 backdrop-blur"
      onClick={onRequestClose}
    >
      <div
        className={clsx(
          "max-h-full max-w-full cursor-auto overflow-auto rounded bg-neutral-800 p-4 lg:p-8 text-neutral-50",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
