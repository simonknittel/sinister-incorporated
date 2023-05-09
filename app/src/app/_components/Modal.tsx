"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { FaRegTimesCircle } from "react-icons/fa";

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
  const router = useRouter();

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex cursor-pointer items-center justify-center bg-neutral-900 bg-opacity-80 p-2 backdrop-blur"
      onClick={onRequestClose || (() => router.back())}
    >
      <div
        className={clsx(
          "max-h-full max-w-full cursor-auto overflow-auto rounded bg-neutral-800 p-4 lg:p-8 text-neutral-50 relative",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}

        <button
          title="Schließen"
          className="absolute right-3 top-3 p-2 text-4xl text-sinister-red-500 hover:text-sinister-red-300 active:text-sinister-red-300"
          onClick={onRequestClose || (() => router.back())}
        >
          <FaRegTimesCircle />
        </button>
      </div>
    </div>,
    document.body
  );
}
