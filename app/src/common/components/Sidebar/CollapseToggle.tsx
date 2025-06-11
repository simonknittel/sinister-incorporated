"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";
import { TbLayoutSidebarLeftCollapseFilled } from "react-icons/tb";

interface Props {
  readonly className?: string;
}

export const CollapseToggle = ({ className }: Props) => {
  const router = useRouter();

  const handleClick = () => {
    if (document.cookie.includes("navigation_collapsed=true")) {
      document.cookie = `navigation_collapsed=; path=/; max-age=0;`;
    } else {
      document.cookie = `navigation_collapsed=true; path=/; max-age=${60 * 60 * 24 * 365};`;
    }

    router.refresh();
  };

  return (
    <button
      className={clsx(
        "px-2 py-1 rounded-secondary border border-neutral-800 hover:border-neutral-600 active:border-neutral-500 text-neutral-600 hover:text-neutral-400 active:text-neutral-300 text-lg",
        className,
      )}
      onClick={handleClick}
      title="Navigation ein-/ausklappen"
    >
      <TbLayoutSidebarLeftCollapseFilled />
    </button>
  );
};
