"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { useOutsideClick } from "../../../lib/useOutsideClick";

type Props = Readonly<{
  children?: ReactNode;
}>;

export const MobileActionBarFlyout = ({ children }: Props) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(false);
  }, [pathname]);

  useOutsideClick(flyoutRef, () => {
    setIsVisible(false);
  });

  return (
    <>
      <button
        onClick={() => setIsVisible((value) => !value)}
        type="button"
        className="flex flex-col items-center justify-center px-4 h-full active:bg-neutral-700 rounded"
      >
        {isVisible ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={clsx(
          "fixed left-0 top-0 bottom-0 w-96 max-w-[90dvw] z-20 flex flex-col bg-neutral-800/90 backdrop-blur shadow overflow-auto transition-transform",
          {
            "-translate-x-full": isVisible === false,
            "translate-x-0": isVisible === true,
          },
        )}
        ref={flyoutRef}
      >
        {children}
      </div>

      {isVisible && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsVisible(false)}
        />
      )}
    </>
  );
};
