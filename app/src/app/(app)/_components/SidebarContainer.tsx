"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import Button from "~/components/Button";

interface Props {
  children?: ReactNode;
}

const SidebarContainer = ({ children }: Props) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(false);
  }, [pathname]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-16 bg-neutral-900 flex items-center px-2 z-20 lg:hidden shadow">
        <Button
          variant="secondary"
          iconOnly={true}
          onClick={() => setIsVisible((value) => !value)}
        >
          {isVisible ? <FaTimes /> : <FaBars />}
        </Button>
      </div>

      <div
        className={clsx(
          "fixed top-16 bottom-0 lg:top-0 w-96 overflow-auto bg-neutral-900 -translate-x-full lg:translate-x-0 z-10 shadow",
          {
            "-translate-x-full": isVisible === false,
            "translate-x-0": isVisible === true,
          }
        )}
      >
        {children}
      </div>
    </>
  );
};

export default SidebarContainer;
