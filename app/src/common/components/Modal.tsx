"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { FaRegTimesCircle } from "react-icons/fa";

type Props = Readonly<{
  className?: string;
  isOpen?: boolean | null;
  onRequestClose?: () => void;
  children?: ReactNode;
  keepChildrenInDom?: boolean;
  heading: ReactNode;
}>;

export default function Modal({
  className,
  isOpen = false,
  children,
  onRequestClose,
  heading,
}: Props) {
  const router = useRouter();
  useHotkeys("esc", onRequestClose || (() => router.back()), undefined, [
    onRequestClose,
  ]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-30 flex cursor-pointer items-start lg:items-center justify-center bg-neutral-800/50 p-4 backdrop-blur"
      onClick={onRequestClose || (() => router.back())}
    >
      <div
        className={clsx(
          "max-h-full max-w-full cursor-auto overflow-auto rounded-2xl bg-neutral-800 text-neutral-50 relative",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-4 lg:px-8 lg:py-4 text-xl font-bold border-b border-white/5">
          {heading}
        </div>

        <div className="p-4 lg:p-8">{children}</div>

        <button
          title="Schließen"
          className="absolute right-2 lg:right-4 top-1 px-2 py-[14px] text-2xl text-sinister-red-500 hover:text-sinister-red-300 active:text-sinister-red-300"
          onClick={onRequestClose || (() => router.back())}
        >
          <FaRegTimesCircle />
        </button>
      </div>
    </div>,
    document.body,
  );
}
